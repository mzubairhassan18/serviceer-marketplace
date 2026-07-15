import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { UserOrdersTable } from "@/components/user-orders-table";

export default async function OrdersPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, gigs!gig_id(title), buyer:profiles!buyer_id(name), provider:profiles!provider_id(name)")
    .or(`buyer_id.eq.${user!.id},provider_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  return <UserOrdersTable orders={orders ?? []} userId={user!.id} />;
}
