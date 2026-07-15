import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createClient(await cookies());

  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: gigCount } = await supabase.from("gigs").select("*", { count: "exact", head: true });
  const { count: pendingGigs } = await supabase.from("gigs").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: orderCount } = await supabase.from("orders").select("*", { count: "exact", head: true });
  const { count: activeSubs } = await supabase.from("provider_subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Admin Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
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
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Active Packages</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{activeSubs ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
