import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { AdminOrdersClient } from "@/components/admin/admin-orders-client";

export default async function AdminOrdersPage() {
  const supabase = createClient(await cookies());

  const { data: orders } = await supabase
    .from("orders")
    .select("*, gigs!gig_id(title), buyer:profiles!buyer_id(name), provider:profiles!provider_id(name)")
    .order("created_at", { ascending: false });

  const { data: packages } = await supabase
    .from("ad_packages")
    .select("*")
    .order("price_minor", { ascending: true });

  return <AdminOrdersClient orders={orders ?? []} packages={packages ?? []} />;
}
