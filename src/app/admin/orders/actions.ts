"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function resolveDisputeAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: admin } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (admin?.role !== "admin") throw new Error("Not authorized");

  const orderId = formData.get("orderId") as string;
  const resolution = formData.get("resolution") as string;

  if (!resolution?.trim()) throw new Error("Resolution notes are required");

  const { data: order } = await supabase
    .from("orders")
    .select("buyer_id, provider_id, gig_id, gigs(title)")
    .eq("id", orderId)
    .single();

  const { error } = await supabase
    .from("orders")
    .update({ status: "dispute_resolved" })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  if (order) {
    const gigTitle = (order as any).gigs?.title ?? "your order";
    const adminMsg = `Admin resolved the dispute: ${resolution.trim()}`;

    for (const recipientId of [order.buyer_id, order.provider_id]) {
      await supabase.from("notifications").insert({
        user_id: recipientId,
        title: "Dispute resolved by admin",
        body: `${gigTitle} — ${resolution.trim().slice(0, 100)}`,
        type: "dispute_resolved",
        entity_type: "order",
        entity_id: orderId,
        href: `/app/orders/${orderId}`,
      });
    }

    await supabase.from("messages").insert({
      order_id: orderId,
      sender_id: user.id,
      body: adminMsg,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/app/orders");
  revalidatePath(`/app/orders/${orderId}`);
}

export async function closeDisputeAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: admin } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (admin?.role !== "admin") throw new Error("Not authorized");

  const orderId = formData.get("orderId") as string;

  const { data: order } = await supabase
    .from("orders")
    .select("buyer_id, provider_id, gig_id, gigs(title)")
    .eq("id", orderId)
    .single();

  const { error } = await supabase
    .from("orders")
    .update({ status: "dispute_closed" })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  if (order) {
    const gigTitle = (order as any).gigs?.title ?? "your order";

    for (const recipientId of [order.buyer_id, order.provider_id]) {
      await supabase.from("notifications").insert({
        user_id: recipientId,
        title: "Dispute closed by admin",
        body: gigTitle,
        type: "dispute_closed",
        entity_type: "order",
        entity_id: orderId,
        href: `/app/orders/${orderId}`,
      });
    }

    await supabase.from("messages").insert({
      order_id: orderId,
      sender_id: user.id,
      body: "This dispute has been closed by the admin.",
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/app/orders");
  revalidatePath(`/app/orders/${orderId}`);
}

export async function adminUpdateOrderStatusAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: admin } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (admin?.role !== "admin") throw new Error("Not authorized");

  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("status") as string;

  const allowedAdminStatuses = ["accepted", "in_progress", "delivered", "completed", "cancelled", "dispute_resolved", "dispute_closed"];
  if (!allowedAdminStatuses.includes(newStatus)) throw new Error("Invalid status for admin");

  const { data: order } = await supabase
    .from("orders")
    .select("buyer_id, provider_id, gigs(title)")
    .eq("id", orderId)
    .single();

  const update: Record<string, any> = { status: newStatus };
  if (newStatus === "delivered") update.delivered_at = new Date().toISOString();
  if (newStatus === "completed") update.completed_at = new Date().toISOString();

  const { error } = await supabase.from("orders").update(update).eq("id", orderId);
  if (error) throw new Error(error.message);

  if (order) {
    const gigTitle = (order as any).gigs?.title ?? "your order";
    for (const recipientId of [order.buyer_id, order.provider_id]) {
      await supabase.from("notifications").insert({
        user_id: recipientId,
        title: `Admin updated order status to "${newStatus}"`,
        body: gigTitle,
        type: "admin_order_update",
        entity_type: "order",
        entity_id: orderId,
        href: `/app/orders/${orderId}`,
      });
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
