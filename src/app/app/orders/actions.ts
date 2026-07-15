"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function updateOrderStatusAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("status") as string;

  const { data: order } = await supabase
    .from("orders")
    .select("status, buyer_id, provider_id")
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

  const update: Record<string, any> = { status: newStatus };
  if (newStatus === "delivered") update.delivered_at = new Date().toISOString();
  if (newStatus === "completed") update.completed_at = new Date().toISOString();

  const { error } = await supabase.from("orders").update(update).eq("id", orderId);
  if (error) throw new Error(error.message);

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
    .select("provider_id, status")
    .eq("id", orderId)
    .single();

  if (!order || order.provider_id !== user.id) throw new Error("Not authorized");
  if (!["inquiry", "offered"].includes(order.status)) throw new Error("Invalid order status");

  const { error } = await supabase
    .from("orders")
    .update({
      status: "offered",
      offered_price: Math.round(price * 100),
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  revalidatePath("/app/orders");
  revalidatePath(`/app/orders/${orderId}`);
}
