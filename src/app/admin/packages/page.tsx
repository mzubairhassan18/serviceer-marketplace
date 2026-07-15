import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function AdminPackagesPage() {
  const supabase = createClient(await cookies());
  const { data: packages } = await supabase
    .from("ad_packages")
    .select("*")
    .order("priceMinor", { ascending: true });

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Ad Packages</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {packages?.map((pkg: any) => (
          <div key={pkg.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontWeight: 600, fontSize: "1.1rem" }}>{pkg.name}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>{pkg.description}</p>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, margin: "1rem 0" }}>
              Rs. {pkg.priceMinor}
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
              Duration: {pkg.durationDays} days
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
              Priority Boost: {pkg.priorityBoost}x
            </div>
            <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
              <span className={`status-badge ${pkg.isActive ? "active" : "expired"}`}>
                {pkg.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
