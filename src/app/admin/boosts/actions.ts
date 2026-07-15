"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { logAuditEvent } from "@/lib/audit";

export async function approveBoostAction(formData: FormData) {
  const boostId = formData.get("boostId") as string;
  if (!boostId) throw new Error("Missing boost ID");

  const supabase = createClient(await cookies());

  const { data: boost } = await supabase
    .from("gig_boosts")
    .select("id, status, subscription_id, gig_id, provider_id, gigs(title), provider_subscriptions(end_date)")
    .eq("id", boostId)
    .single();

  if (!boost) throw new Error("Boost request not found");
  if (boost.status !== "pending") throw new Error("Boost is not pending");

  const endDate = (boost as any).provider_subscriptions?.end_date;
  if (!endDate) throw new Error("Subscription end date not found");

  await supabase.from("gig_boosts").update({ status: "approved" }).eq("id", boostId);
  await supabase.from("gigs").update({ featured_until: endDate }).eq("id", boost.gig_id);

  const gigTitle = (boost as any).gigs?.title ?? "your gig";
  await supabase.from("notifications").insert({
    user_id: boost.provider_id,
    title: "Your gig boost has been approved",
    body: gigTitle,
    type: "boost_approved",
    entity_type: "gig",
    entity_id: boost.gig_id,
    href: `/app/gigs`,
  });

  await logAuditEvent("boost_approved", "gig_boost", boostId, `Approved boost for: ${gigTitle}`);

  revalidatePath("/admin/boosts");
}

export async function rejectBoostAction(formData: FormData) {
  const boostId = formData.get("boostId") as string;
  if (!boostId) throw new Error("Missing boost ID");

  const supabase = createClient(await cookies());

  const { data: boost } = await supabase
    .from("gig_boosts")
    .select("id, status, provider_id, gig_id, gigs(title)")
    .eq("id", boostId)
    .single();

  if (!boost) throw new Error("Boost request not found");
  if (boost.status !== "pending") throw new Error("Boost is not pending");

  await supabase.from("gig_boosts").update({ status: "rejected" }).eq("id", boostId);

  const gigTitle = (boost as any).gigs?.title ?? "your gig";
  await supabase.from("notifications").insert({
    user_id: boost.provider_id,
    title: "Your gig boost has been rejected",
    body: gigTitle,
    type: "boost_rejected",
    entity_type: "gig",
    entity_id: boost.gig_id,
    href: `/app/gigs`,
  });

  await logAuditEvent("boost_rejected", "gig_boost", boostId, `Rejected boost for: ${gigTitle}`);

  revalidatePath("/admin/boosts");
}
