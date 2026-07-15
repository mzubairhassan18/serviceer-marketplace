import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/format";
import { OrderChat } from "@/components/orders/order-chat";
import { AdminOrderControls } from "./admin-controls";

export default async function AdminOrderDetailPage(props: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await props.params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*, gigs!gig_id(title), buyer:profiles!buyer_id(name), provider:profiles!provider_id(name)")
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  const isDisputed = order.status === "disputed" || order.status === "dispute_resolved" || order.status === "dispute_closed";

  return (
    <div>
      <Link href="/admin/orders" style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", textDecoration: "none" }}>
        &larr; Back to orders
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "1rem", marginBottom: "0.25rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>{order.gigs?.title}</h1>
        <span className={`status-badge ${order.status}`}>{order.status}</span>
      </div>
      <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Buyer: {order.buyer?.name} &middot; Provider: {order.provider?.name}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="card" style={{ padding: "1rem" }}>
          <h3 style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--muted-foreground)" }}>Order Details</h3>
          {order.description && (
            <p style={{ fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "0.75rem" }}>{order.description}</p>
          )}
          {order.offered_price && (
            <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>Budget: {formatPrice(order.offered_price)}</p>
          )}
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.5rem" }}>
            Created: {new Date(order.created_at).toLocaleDateString()}
          </p>
          {order.delivered_at && (
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
              Delivered: {new Date(order.delivered_at).toLocaleDateString()}
            </p>
          )}
          {order.completed_at && (
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
              Completed: {new Date(order.completed_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="card" style={{ padding: "1rem" }}>
          <h3 style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--muted-foreground)" }}>Admin Controls</h3>
          <AdminOrderControls orderId={order.id} status={order.status} />
        </div>
      </div>

      {isDisputed && order.dispute_reason && (
        <div className="card" style={{ padding: "1rem", marginBottom: "1.5rem", borderLeft: "4px solid #dc2626" }}>
          <h3 style={{ fontWeight: 600, fontSize: "0.85rem", color: "#dc2626", marginBottom: "0.5rem" }}>Dispute Details</h3>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>{order.dispute_reason}</p>
          {order.dispute_created_at && (
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
              Raised: {new Date(order.dispute_created_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
          You are intervening as admin. Messages you send will appear in the chat.
        </p>
      </div>

      <OrderChat orderId={order.id} userId={user!.id} initialMessages={messages ?? []} />
    </div>
  );
}
