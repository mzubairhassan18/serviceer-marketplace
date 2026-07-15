"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function requestBoostAction(formData: FormData) {
  const gigId = formData.get("gigId") as string;
  const subscriptionId = formData.get("subscriptionId") as string;

  if (!gigId || !subscriptionId) throw new Error("Missing required fields");

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, provider_id")
    .eq("id", gigId)
    .eq("provider_id", user.id)
    .single();

  if (!gig) throw new Error("Gig not found or not yours");

  const { data: subscription } = await supabase
    .from("provider_subscriptions")
    .select("id, provider_id, package_id, status, end_date, ad_packages(max_gigs)")
    .eq("id", subscriptionId)
    .eq("provider_id", user.id)
    .single();

  if (!subscription) throw new Error("Subscription not found");

  if (subscription.status !== "active" || new Date(subscription.end_date) <= new Date()) {
    throw new Error("Subscription is not active or has expired");
  }

  const { count } = await supabase
    .from("gig_boosts")
    .select("id", { count: "exact", head: true })
    .eq("subscription_id", subscriptionId)
    .in("status", ["pending", "approved"]);

  const maxGigs = (subscription as any).ad_packages?.max_gigs ?? 0;
  if ((count ?? 0) >= maxGigs) {
    throw new Error(`This package allows a maximum of ${maxGigs} boosted gigs`);
  }

  const { error } = await supabase.from("gig_boosts").insert({
    gig_id: gigId,
    provider_id: user.id,
    subscription_id: subscriptionId,
    status: "pending",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/app/gigs");
}

export async function cancelBoostAction(formData: FormData) {
  const boostId = formData.get("boostId") as string;
  if (!boostId) throw new Error("Missing boost ID");

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: boost } = await supabase
    .from("gig_boosts")
    .select("id, provider_id, status")
    .eq("id", boostId)
    .eq("provider_id", user.id)
    .single();

  if (!boost) throw new Error("Boost request not found or not yours");
  if (boost.status !== "pending") throw new Error("Only pending requests can be cancelled");

  await supabase.from("gig_boosts").delete().eq("id", boostId);
  revalidatePath("/app/gigs");
}
