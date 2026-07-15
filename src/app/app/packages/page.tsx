import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/format";
import { SubscribeButton } from "./subscribe-button";

export default async function PackagesPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: packages } = await supabase
    .from("ad_packages")
    .select("*")
    .eq("is_active", true)
    .order("price_minor", { ascending: true });

  const { data: subscriptions } = await supabase
    .from("provider_subscriptions")
    .select("*, ad_packages(name)")
    .eq("provider_id", user!.id)
    .order("created_at", { ascending: false });

  const activeSub = subscriptions?.find((s: any) => s.status === "active" && new Date(s.end_date) > new Date());

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>Ad Packages</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
        Boost your gigs with priority placement in search results.
      </p>

      {activeSub && (
        <div className="card" style={{ marginBottom: "1.5rem", borderLeft: "4px solid #15803d" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>Active: {(activeSub as any).ad_packages?.name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                Expires {new Date(activeSub.end_date).toLocaleDateString()}
              </div>
            </div>
            <span className="status-badge active">Active</span>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {packages?.map((pkg: any) => (
          <div key={pkg.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontWeight: 600, fontSize: "1.1rem" }}>{pkg.name}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>{pkg.description}</p>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, margin: "1rem 0" }}>
              {formatPrice(pkg.price_minor)}
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
              Duration: {pkg.duration_days} days
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
              Priority Boost: {pkg.priority_boost}x
            </div>
            <div style={{ marginTop: "auto" }}>
              <SubscribeButton packageId={pkg.id} packageName={pkg.name} />
            </div>
          </div>
        ))}
      </div>

      {!packages || packages.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--muted-foreground)" }}>No packages available yet.</p>
        </div>
      ) : null}
    </div>
  );
}
