"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function subscribeAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const packageId = formData.get("packageId") as string;
  if (!packageId) throw new Error("No package selected");

  const { data: pkg, error: pkgErr } = await supabase
    .from("ad_packages")
    .select("*")
    .eq("id", packageId)
    .eq("is_active", true)
    .single();

  if (pkgErr || !pkg) throw new Error("Package not found or inactive");

  const now = new Date();
  const endDate = new Date(now.getTime() + pkg.duration_days * 24 * 60 * 60 * 1000);

  const { error } = await supabase.from("provider_subscriptions").insert({
    provider_id: user.id,
    package_id: packageId,
    status: "active",
    start_date: now.toISOString(),
    end_date: endDate.toISOString(),
    payment_details: (formData.get("paymentDetails") as string) || null,
  });

  if (error) throw new Error(error.message);
}
