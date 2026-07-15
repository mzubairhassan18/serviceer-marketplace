"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function createGigAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price")) || 0;
  const tagsRaw = (formData.get("tags") as string) || "";
  const location = (formData.get("location") as string) || "";
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  const { error } = await supabase.from("gigs").insert({
    providerId: user.id,
    title,
    category,
    description,
    price: price * 100,
    tags,
    location,
    status: "pending",
    currency: "PKR",
  });

  if (error) throw new Error(error.message);
  redirect("/app/gigs");
}
