import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { AdminOrdersTable } from "@/components/admin/admin-orders-table";

export default async function AdminOrdersPage() {
  const supabase = createClient(await cookies());

  const { data: orders } = await supabase
    .from("orders")
    .select("*, gigs!gig_id(title), buyer:profiles!buyer_id(name), provider:profiles!provider_id(name)")
    .order("created_at", { ascending: false });

  return <AdminOrdersTable orders={orders ?? []} />;
}
