import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/format";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = createClient(await cookies());

  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: gigCount } = await supabase.from("gigs").select("*", { count: "exact", head: true });
  const { count: pendingGigs } = await supabase.from("gigs").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: orderCount } = await supabase.from("orders").select("*", { count: "exact", head: true });
  const { count: activeSubs } = await supabase.from("provider_subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
  const { count: pendingBoosts } = await supabase.from("gig_boosts").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: disputedOrders } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "disputed");

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*, gigs(title), profiles!buyer_id(name), profiles!provider_id(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Admin Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Total Users</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{userCount ?? 0}</div>
        </div>
        <div className="card" style={{ borderLeft: "3px solid #f59e0b" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Pending Gigs</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{pendingGigs ?? 0}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Total Gigs</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{gigCount ?? 0}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Orders</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{orderCount ?? 0}</div>
        </div>
        <div className="card" style={{ borderLeft: "3px solid #15803d" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Active Packages</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{activeSubs ?? 0}</div>
        </div>
        <div className="card" style={{ borderLeft: pendingBoosts && pendingBoosts > 0 ? "3px solid #f59e0b" : undefined }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Pending Boosts</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{pendingBoosts ?? 0}</div>
        </div>
        <div className="card" style={{ borderLeft: disputedOrders && disputedOrders > 0 ? "3px solid #dc2626" : undefined }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Disputed Orders</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{disputedOrders ?? 0}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Recent Orders</h2>
        <Link href="/admin/orders" style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>View all</Link>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Gig</th>
            <th>Buyer</th>
            <th>Provider</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders?.map((order: any) => (
            <tr key={order.id}>
              <td style={{ fontWeight: 500 }}>{order.gigs?.title ?? "Unknown"}</td>
              <td>{(order as any).profiles?.name ?? "Unknown"}</td>
              <td>{(order as any).profiles?.name ?? "Unknown"}</td>
              <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
              <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {new Date(order.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {(!recentOrders || recentOrders.length === 0) && (
            <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "2rem" }}>No orders yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
