"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function sendContactAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const gigId = formData.get("gigId") as string;
  const providerId = formData.get("providerId") as string;
  const description = formData.get("description") as string;
  const offeredPrice = formData.get("offered_price") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;

  if (!description?.trim()) throw new Error("Description is required");
  if (!offeredPrice || Number(offeredPrice) <= 0) throw new Error("Valid budget is required");

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

  if (message?.trim()) {
    await supabase.from("messages").insert({
      order_id: order.id,
      sender_id: user.id,
      body: message.trim(),
    });
  }

  redirect("/app/orders");
}
