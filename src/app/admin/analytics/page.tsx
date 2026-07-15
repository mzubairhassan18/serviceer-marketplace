import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/format";

export default async function AdminAnalyticsPage() {
  const supabase = createClient(await cookies());

  // Revenue from package subscriptions
  const { data: subscriptions } = await supabase
    .from("provider_subscriptions")
    .select("id, status, start_date, package_id, ad_packages(name, price_minor, duration_days)")
    .order("created_at", { ascending: false });

  const activeSubs = subscriptions?.filter((s) => s.status === "active") ?? [];
  const expiredSubs = subscriptions?.filter((s) => s.status === "expired") ?? [];
  const cancelledSubs = subscriptions?.filter((s) => s.status === "cancelled") ?? [];

  // Total revenue
  const totalRevenue = activeSubs.reduce((sum, s) => sum + ((s as any).ad_packages?.price_minor ?? 0), 0);

  // Revenue by package
  const revenueByPackage: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const sub of activeSubs) {
    const pkgName = (sub as any).ad_packages?.name ?? "Unknown";
    if (!revenueByPackage[pkgName]) revenueByPackage[pkgName] = { name: pkgName, count: 0, revenue: 0 };
    revenueByPackage[pkgName].count++;
    revenueByPackage[pkgName].revenue += (sub as any).ad_packages?.price_minor ?? 0;
  }

  // Monthly breakdown (last 6 months)
  const monthlyData: { month: string; count: number; revenue: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const monthStart = d.toISOString();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const monthSubs = (subscriptions ?? []).filter((s) => {
      const created = (s as any).created_at;
      return created >= monthStart && created <= monthEnd;
    });
    monthlyData.push({
      month: monthStr,
      count: monthSubs.length,
      revenue: monthSubs.reduce((sum, s) => sum + ((s as any).ad_packages?.price_minor ?? 0), 0),
    });
  }

  // Other stats
  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true });
  const { count: completedOrders } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed");
  const { count: disputedOrders } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "disputed");
  const { count: totalReviews } = await supabase.from("reviews").select("*", { count: "exact", head: true });
  const { data: avgReview } = await supabase.from("reviews").select("rating");
  const avgRating = avgReview && avgReview.length > 0
    ? (avgReview.reduce((sum: number, r: any) => sum + r.rating, 0) / avgReview.length).toFixed(1)
    : "—";

  const { count: totalGigs } = await supabase.from("gigs").select("*", { count: "exact", head: true });
  const { count: activeGigs } = await supabase.from("gigs").select("*", { count: "exact", head: true }).eq("status", "approved");

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Analytics & Revenue</h1>

      {/* Revenue cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card" style={{ borderLeft: "3px solid #15803d" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Total Package Revenue</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#15803d" }}>{formatPrice(totalRevenue)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Active Subscriptions</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{activeSubs.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Expired Subscriptions</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{expiredSubs.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Cancelled Subscriptions</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{cancelledSubs.length}</div>
        </div>
      </div>

      {/* Order stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Total Orders</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{totalOrders ?? 0}</div>
        </div>
        <div className="card" style={{ borderLeft: "3px solid #15803d" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Completed Orders</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{completedOrders ?? 0}</div>
        </div>
        <div className="card" style={{ borderLeft: disputedOrders && disputedOrders > 0 ? "3px solid #dc2626" : undefined }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Disputed Orders</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{disputedOrders ?? 0}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Total Reviews</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{totalReviews ?? 0} <span style={{ fontSize: "0.9rem", color: "#f59e0b" }}>({avgRating}★)</span></div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Total Gigs</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{totalGigs ?? 0} <span style={{ fontSize: "0.9rem", color: "var(--muted-foreground)" }}>({activeGigs ?? 0} active)</span></div>
        </div>
      </div>

      {/* Revenue by package */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>Revenue by Package</h2>
      <table className="data-table" style={{ marginBottom: "2rem" }}>
        <thead>
          <tr>
            <th>Package</th>
            <th>Active Subscribers</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(revenueByPackage).map((pkg) => (
            <tr key={pkg.name}>
              <td style={{ fontWeight: 500 }}>{pkg.name}</td>
              <td>{pkg.count}</td>
              <td style={{ color: "#15803d", fontWeight: 600 }}>{formatPrice(pkg.revenue)}</td>
            </tr>
          ))}
          {Object.keys(revenueByPackage).length === 0 && (
            <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "2rem" }}>No active subscriptions</td></tr>
          )}
        </tbody>
      </table>

      {/* Monthly breakdown */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>Monthly Revenue (Last 6 Months)</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>New Subscriptions</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {monthlyData.map((m) => (
            <tr key={m.month}>
              <td style={{ fontWeight: 500 }}>{m.month}</td>
              <td>{m.count}</td>
              <td style={{ color: "#15803d", fontWeight: 600 }}>{formatPrice(m.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
