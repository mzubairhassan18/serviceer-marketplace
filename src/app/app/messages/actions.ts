"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function sendMessageAction(orderId: string, body: string) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: msg, error } = await supabase
    .from("messages")
    .insert({ order_id: orderId, sender_id: user.id, body: body.trim() })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const { data: order } = await supabase
    .from("orders")
    .select("buyer_id, provider_id, gig_id, gigs(title)")
    .eq("id", orderId)
    .single();

  if (order) {
    const { data: sender } = await supabase.from("profiles").select("name, role").eq("id", user.id).single();
    const gigTitle = (order as any).gigs?.title ?? "your order";
    const isAdmin = sender?.role === "admin";

    const recipients = isAdmin
      ? [order.buyer_id, order.provider_id]
      : [order.buyer_id === user.id ? order.provider_id : order.buyer_id];

    for (const recipientId of recipients) {
      await supabase.from("notifications").insert({
        user_id: recipientId,
        title: isAdmin ? `Admin message on "${gigTitle}"` : `New message from ${sender?.name ?? "someone"}`,
        body: isAdmin ? body.trim().slice(0, 120) : body.trim().slice(0, 120),
        type: "message",
        entity_type: "order",
        entity_id: orderId,
        href: `/app/orders/${orderId}`,
      });
    }
  }

  return msg;
}
