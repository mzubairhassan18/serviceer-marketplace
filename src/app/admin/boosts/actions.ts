"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function approveBoostAction(formData: FormData) {
  const boostId = formData.get("boostId") as string;
  if (!boostId) throw new Error("Missing boost ID");

  const supabase = createClient(await cookies());

  const { data: boost } = await supabase
    .from("gig_boosts")
    .select("id, status, subscription_id, gig_id, provider_subscriptions(end_date)")
    .eq("id", boostId)
    .single();

  if (!boost) throw new Error("Boost request not found");
  if (boost.status !== "pending") throw new Error("Boost is not pending");

  const endDate = (boost as any).provider_subscriptions?.end_date;
  if (!endDate) throw new Error("Subscription end date not found");

  await supabase.from("gig_boosts").update({ status: "approved" }).eq("id", boostId);
  await supabase.from("gigs").update({ featured_until: endDate }).eq("id", boost.gig_id);

  revalidatePath("/admin/boosts");
}

export async function rejectBoostAction(formData: FormData) {
  const boostId = formData.get("boostId") as string;
  if (!boostId) throw new Error("Missing boost ID");

  const supabase = createClient(await cookies());

  const { data: boost } = await supabase
    .from("gig_boosts")
    .select("id, status")
    .eq("id", boostId)
    .single();

  if (!boost) throw new Error("Boost request not found");
  if (boost.status !== "pending") throw new Error("Boost is not pending");

  await supabase.from("gig_boosts").update({ status: "rejected" }).eq("id", boostId);
  revalidatePath("/admin/boosts");
}
