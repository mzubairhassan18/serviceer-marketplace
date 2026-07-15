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

  await supabase.from("profiles").update({ role: "provider" }).eq("id", user.id);

  const { data: gig, error } = await supabase.from("gigs").insert({
    provider_id: user.id,
    title,
    category,
    description,
    price: price * 100,
    tags,
    location,
    status: "pending",
    currency: "PKR",
  }).select("id").single();

  if (error) throw new Error(error.message);

  // Notify all admins
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  const { data: provider } = await supabase.from("profiles").select("name").eq("id", user.id).single();

  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await supabase.from("notifications").insert({
        user_id: admin.id,
        title: `New gig submitted: ${title}`,
        body: `By ${provider?.name ?? "a provider"} — awaiting review`,
        type: "gig_created",
        entity_type: "gig",
        entity_id: gig?.id,
        href: `/admin/gigs`,
      });
    }
  }

  redirect("/app/gigs");
}
