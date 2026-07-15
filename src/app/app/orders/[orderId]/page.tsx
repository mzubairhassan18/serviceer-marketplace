import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/format";
import { OrderChat } from "@/components/orders/order-chat";
import { StatusTimeline } from "@/components/orders/status-timeline";
import { OrderActions } from "./order-actions";
import { ReviewForm } from "./review-form";
import { DisputeForm } from "./dispute-form";

export default async function OrderDetailPage(props: { params: Promise<{ orderId: string }> }) {
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

  // Fetch sender profiles for chat
  const senderIds = [...new Set((messages ?? []).map((m: any) => m.sender_id))];
  const { data: senderProfiles } = senderIds.length > 0
    ? await supabase.from("profiles").select("id, name, role").in("id", senderIds)
    : { data: [] };

  const senders: Record<string, { id: string; name: string; role?: string }> = {};
  (senderProfiles ?? []).forEach((p: any) => { senders[p.id] = p; });

  // Fetch status history
  const { data: statusHistory } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  const isBuyer = order.buyer_id === user!.id;
  const isProvider = order.provider_id === user!.id;

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  const reviewableStatuses = ["completed", "dispute_resolved", "dispute_closed"];
  const showReviewForm = reviewableStatuses.includes(order.status) && isBuyer && !existingReview;
  const showDisputeBtn = ["inquiry", "offered", "accepted", "in_progress", "delivered"].includes(order.status);

  return (
    <div>
      <Link href="/app/orders" style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", textDecoration: "none" }}>
        &larr; Back to orders
      </Link>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginTop: "1rem", marginBottom: "0.25rem" }}>{order.gigs?.title}</h1>
      <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        {isBuyer ? `Provider: ${order.provider?.name}` : `Buyer: ${order.buyer?.name}`} &middot;{" "}
        <span className={`status-badge ${order.status}`}>{order.status}</span>
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
          <h3 style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--muted-foreground)" }}>Status Actions</h3>
          {order.status === "disputed" ? (
            <div style={{ padding: "1rem", background: "#fef2f2", borderRadius: "var(--radius)", border: "1px solid #fecaca" }}>
              <p style={{ fontWeight: 600, color: "#dc2626", fontSize: "0.9rem", marginBottom: "0.5rem" }}>This order is under dispute</p>
              {order.dispute_reason && (
                <p style={{ fontSize: "0.85rem", color: "#7f1d1d", lineHeight: 1.5 }}>{order.dispute_reason}</p>
              )}
              {order.dispute_raised_by && (
                <p style={{ fontSize: "0.75rem", color: "#991b1b", marginTop: "0.5rem" }}>
                  Raised by: {isBuyer && order.dispute_raised_by === user!.id ? "You" : "Other party"}
                </p>
              )}
            </div>
          ) : (
            <OrderActions
              orderId={order.id}
              status={order.status}
              isBuyer={isBuyer}
              isProvider={isProvider}
              offeredPrice={order.offered_price}
            />
          )}
        </div>
      </div>

      {showDisputeBtn && order.status !== "disputed" && isBuyer && (
        <div style={{ marginBottom: "1.5rem" }}>
          <DisputeForm orderId={order.id} />
        </div>
      )}

      {showReviewForm && (
        <div style={{ marginBottom: "1.5rem" }}>
          <ReviewForm orderId={order.id} gigId={order.gig_id} />
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <StatusTimeline entries={statusHistory ?? []} />
      </div>

      <OrderChat
        orderId={order.id}
        userId={user!.id}
        initialMessages={messages ?? []}
        senders={senders}
        currentUserName={isBuyer ? order.buyer?.name : order.provider?.name}
      />
    </div>
  );
}
