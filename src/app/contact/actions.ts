"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function sendContactAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const gigId = formData.get("gigId") as string;
  const description = formData.get("description") as string;
  const offeredPrice = formData.get("offered_price") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;

  if (!description?.trim()) throw new Error("Description is required");
  if (!offeredPrice || Number(offeredPrice) <= 0) throw new Error("Valid budget is required");

  const { data: gigRecord, error: gigError } = await supabase
    .from("gigs")
    .select("title, provider_id")
    .eq("id", gigId)
    .eq("status", "approved")
    .single();
  if (gigError || !gigRecord) throw new Error("This service is no longer available");
  const providerId = gigRecord.provider_id;
  if (providerId === user.id) throw new Error("You cannot inquire about your own service");

  const priceInPaisa = Math.round(Number(offeredPrice) * 100);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      gig_id: gigId,
      buyer_id: user.id,
      provider_id: providerId,
      status: "inquiry",
      description: description.trim(),
      offered_price: priceInPaisa,
      initial_message: message?.trim() || "",
      contact_phone: phone || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Record initial status in history
  await supabase.from("order_status_history").insert({
    order_id: order.id,
    from_status: null,
    to_status: "inquiry",
    actor_id: user.id,
    actor_name: "",
    note: "Order created",
  });

  if (message?.trim()) {
    await supabase.from("messages").insert({
      order_id: order.id,
      sender_id: user.id,
      body: message.trim(),
    });
  }

  // Notify provider
  const { data: buyer } = await supabase.from("profiles").select("name").eq("id", user.id).single();

  await supabase.from("notifications").insert({
    user_id: providerId,
    title: `${buyer?.name ?? "Someone"} placed an order`,
    body: `${gigRecord.title ?? "Your service"} — Rs. ${Number(offeredPrice).toLocaleString()}`,
    type: "new_order",
    entity_type: "order",
    entity_id: order.id,
    href: `/app/orders/${order.id}`,
  });

  redirect("/app/orders");
}
