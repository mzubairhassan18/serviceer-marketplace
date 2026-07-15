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
  const message = formData.get("message") as string;
  const phone = formData.get("phone") as string;

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      gigId,
      buyerId: user.id,
      providerId,
      status: "inquiry",
      initialMessage: message,
      contactPhone: phone || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("messages").insert({
    orderId: order.id,
    senderId: user.id,
    body: message,
  });

  redirect("/app/orders");
}
