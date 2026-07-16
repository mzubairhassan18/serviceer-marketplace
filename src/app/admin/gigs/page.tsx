import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { AdminGigsClient } from "@/components/admin/admin-gigs-client";

export default async function AdminGigsPage() {
  const supabase = createClient(await cookies());

  const { data: gigs } = await supabase
    .from("gigs")
    .select("*, profiles!provider_id(name)")
    .order("created_at", { ascending: false });

  const { data: boosts } = await supabase
    .from("gig_boosts")
    .select(`
      id, status, created_at,
      profiles!provider_id(name),
      gigs!gig_id(title),
      provider_subscriptions!subscription_id(end_date, ad_packages(name))
    `)
    .order("created_at", { ascending: false });

  return <AdminGigsClient gigs={gigs ?? []} boosts={boosts ?? []} />;
}
