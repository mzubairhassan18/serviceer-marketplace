"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function updateGigAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const gigId = formData.get("gigId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price")) || 0;
  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  const { error } = await supabase
    .from("gigs")
    .update({ title, description, price: price * 100, tags, updatedAt: new Date().toISOString() })
    .eq("id", gigId)
    .eq("providerId", user.id);

  if (error) throw new Error(error.message);
  redirect("/app/gigs");
}
