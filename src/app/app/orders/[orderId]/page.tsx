import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { OrderChat } from "@/components/orders/order-chat";

export default async function OrderDetailPage(props: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await props.params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*, gigs!gig_id(title), profiles!buyer_id(name)")
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("orderId", orderId)
    .order("createdAt", { ascending: true });

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>{order.gigs?.title}</h1>
      <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Order with {order.profiles?.name} &middot; <span className={`status-badge`}>{order.status}</span>
      </p>

      <OrderChat orderId={order.id} userId={user!.id} initialMessages={messages ?? []} />
    </div>
  );
}
