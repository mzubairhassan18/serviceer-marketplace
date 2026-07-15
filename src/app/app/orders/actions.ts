"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

const statusLabels: Record<string, string> = {
  offered: "sent you an offer",
  accepted: "accepted your order",
  in_progress: "started working on your order",
  delivered: "marked the order as delivered",
  payment_received: "confirmed payment received",
  completed: "completed the order",
  cancelled: "cancelled the order",
  disputed: "raised a dispute",
};

export async function updateOrderStatusAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("status") as string;

  const { data: order } = await supabase
    .from("orders")
    .select("status, buyer_id, provider_id, gig_id, gigs(title)")
    .eq("id", orderId)
    .single();

  if (!order) throw new Error("Order not found");

  const isBuyer = order.buyer_id === user.id;
  const isProvider = order.provider_id === user.id;

  const validTransitions: Record<string, { buyer?: string[]; provider?: string[] }> = {
    inquiry: { provider: ["accepted", "offered", "cancelled"] },
    offered: { buyer: ["accepted", "cancelled"], provider: ["cancelled"] },
    accepted: { provider: ["in_progress", "cancelled"] },
    in_progress: { provider: ["delivered", "cancelled"] },
    delivered: { buyer: ["payment_received"] },
    payment_received: { buyer: ["completed"] },
  };

  const allowed = isBuyer
    ? validTransitions[order.status]?.buyer ?? []
    : validTransitions[order.status]?.provider ?? [];

  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
  }

  const fromStatus = order.status;
  const update: Record<string, any> = { status: newStatus };
  if (newStatus === "delivered") update.delivered_at = new Date().toISOString();
  if (newStatus === "completed") update.completed_at = new Date().toISOString();

  const { error } = await supabase.from("orders").update(update).eq("id", orderId);
  if (error) throw new Error(error.message);

  // Record status history
  const { data: actor } = await supabase.from("profiles").select("name").eq("id", user.id).single();
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: fromStatus,
    to_status: newStatus,
    actor_id: user.id,
    actor_name: actor?.name ?? "",
    note: "",
  });

  const recipientId = isBuyer ? order.provider_id : order.buyer_id;
  const gigTitle = (order as any).gigs?.title ?? "your order";
  const label = statusLabels[newStatus] || `updated order to "${newStatus}"`;

  await supabase.from("notifications").insert({
    user_id: recipientId,
    title: `${actor?.name ?? "Someone"} ${label}`,
    body: `Order: ${gigTitle}`,
    type: "order_status",
    entity_type: "order",
    entity_id: orderId,
    href: `/app/orders/${orderId}`,
  });

  revalidatePath("/app/orders");
  revalidatePath(`/app/orders/${orderId}`);
}

export async function raiseDisputeAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const orderId = formData.get("orderId") as string;
  const reason = formData.get("reason") as string;

  if (!reason?.trim()) throw new Error("Dispute reason is required");

  const { data: order } = await supabase
    .from("orders")
    .select("status, buyer_id, provider_id, gig_id, gigs(title)")
    .eq("id", orderId)
    .single();

  const { error } = await supabase
    .from("orders")
    .update({
      status: "disputed",
      dispute_reason: reason.trim(),
      dispute_raised_by: user.id,
      dispute_created_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  // Record status history
  const { data: actor } = await supabase.from("profiles").select("name").eq("id", user.id).single();
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: order?.status ?? null,
    to_status: "disputed",
    actor_id: user.id,
    actor_name: actor?.name ?? "",
    note: reason.trim(),
  });

  if (order) {
    const recipientId = order.buyer_id === user.id ? order.provider_id : order.buyer_id;
    const gigTitle = (order as any).gigs?.title ?? "your order";

    await supabase.from("notifications").insert({
      user_id: recipientId,
      title: `${actor?.name ?? "Someone"} raised a dispute`,
      body: `Order: ${gigTitle} — ${reason.trim().slice(0, 100)}`,
      type: "dispute",
      entity_type: "order",
      entity_id: orderId,
      href: `/app/orders/${orderId}`,
    });

    // Notify admin
    const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
    if (admins) {
      for (const admin of admins) {
        await supabase.from("notifications").insert({
          user_id: admin.id,
          title: `Dispute raised on "${gigTitle}"`,
          body: `By ${actor?.name ?? "someone"} — ${reason.trim().slice(0, 100)}`,
          type: "dispute",
          entity_type: "order",
          entity_id: orderId,
          href: `/admin/orders/${orderId}`,
        });
      }
    }
  }

  revalidatePath("/app/orders");
  revalidatePath(`/app/orders/${orderId}`);
}

export async function sendOfferAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const orderId = formData.get("orderId") as string;
  const price = Number(formData.get("offered_price") as string);

  if (!price || price <= 0) throw new Error("Invalid price");

  const { data: order } = await supabase
    .from("orders")
    .select("buyer_id, provider_id, status, gig_id, gigs(title)")
    .eq("id", orderId)
    .single();

  if (!order || order.provider_id !== user.id) throw new Error("Not authorized");
  if (!["inquiry", "offered"].includes(order.status)) throw new Error("Invalid order status");

  const fromStatus = order.status;
  const { error } = await supabase
    .from("orders")
    .update({
      status: "offered",
      offered_price: Math.round(price * 100),
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  // Record status history
  const { data: actor } = await supabase.from("profiles").select("name").eq("id", user.id).single();
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: fromStatus,
    to_status: "offered",
    actor_id: user.id,
    actor_name: actor?.name ?? "",
    note: `Offer: Rs. ${price.toLocaleString()}`,
  });

  const gigTitle = (order as any).gigs?.title ?? "your inquiry";

  await supabase.from("notifications").insert({
    user_id: order.buyer_id,
    title: `${actor?.name ?? "Someone"} sent you an offer`,
    body: `Order: ${gigTitle} — Rs. ${price.toLocaleString()}`,
    type: "offer",
    entity_type: "order",
    entity_id: orderId,
    href: `/app/orders/${orderId}`,
  });

  revalidatePath("/app/orders");
  revalidatePath(`/app/orders/${orderId}`);
}
