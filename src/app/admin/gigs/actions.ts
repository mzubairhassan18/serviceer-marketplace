"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function approveGigAction(formData: FormData) {
  const gigId = formData.get("gigId") as string;
  const supabase = createClient(await cookies());

  const { data: gig } = await supabase
    .from("gigs")
    .select("provider_id, title")
    .eq("id", gigId)
    .single();

  await supabase.from("gigs").update({ status: "approved" }).eq("id", gigId);

  if (gig) {
    await supabase.from("notifications").insert({
      user_id: gig.provider_id,
      title: "Your gig has been approved",
      body: gig.title,
      type: "gig_approved",
      entity_type: "gig",
      entity_id: gigId,
      href: `/app/gigs`,
    });
  }

  revalidatePath("/admin/gigs");
}

export async function rejectGigAction(formData: FormData) {
  const gigId = formData.get("gigId") as string;
  const supabase = createClient(await cookies());

  const { data: gig } = await supabase
    .from("gigs")
    .select("provider_id, title")
    .eq("id", gigId)
    .single();

  await supabase.from("gigs").update({ status: "rejected" }).eq("id", gigId);

  if (gig) {
    await supabase.from("notifications").insert({
      user_id: gig.provider_id,
      title: "Your gig has been rejected",
      body: gig.title,
      type: "gig_rejected",
      entity_type: "gig",
      entity_id: gigId,
      href: `/app/gigs`,
    });
  }

  revalidatePath("/admin/gigs");
}
