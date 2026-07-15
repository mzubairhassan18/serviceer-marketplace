import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: myGigs } = await supabase
    .from("gigs")
    .select("id, title, status", { count: "exact" })
    .eq("provider_id", user!.id);

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", user!.id);

  const { count: activeSubs } = await supabase
    .from("provider_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", user!.id)
    .eq("status", "active");

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        Welcome, {profile?.name ?? "User"}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Active Gigs</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{myGigs?.length ?? 0}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Total Orders</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{orderCount ?? 0}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Active Subscriptions</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{activeSubs ?? 0}</div>
        </div>
      </div>

      {profile?.role === "buyer" && (
        <div className="card">
          <h2 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Browse Services</h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Find professionals for your next task.
          </p>
          <a href="/gigs" className="btn btn-primary" style={{ textDecoration: "none" }}>Browse Gigs</a>
        </div>
      )}
    </div>
  );
}
