import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { OrderChat } from "@/components/orders/order-chat";

export default async function MessageThreadPage(props: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await props.params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*, gigs!gig_id(title)")
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
        {order.gigs?.title ?? "Chat"}
      </h1>
      <OrderChat orderId={order.id} userId={user!.id} initialMessages={messages ?? []} />
    </div>
  );
}
