import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AdminOrdersPage() {
  const supabase = createClient(await cookies());

  const { data: orders } = await supabase
    .from("orders")
    .select("*, gigs!gig_id(title), profiles!buyer_id(name)")
    .order("created_at", { ascending: false });

  const disputed = orders?.filter((o: any) => o.status === "disputed") ?? [];
  const others = orders?.filter((o: any) => o.status !== "disputed") ?? [];

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>All Orders</h1>

      {disputed.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#dc2626", marginBottom: "0.75rem" }}>
            Disputed Orders ({disputed.length})
          </h2>
          <table className="data-table" style={{ border: "1px solid #fecaca" }}>
            <thead>
              <tr>
                <th>Gig</th>
                <th>Buyer</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {disputed.map((o: any) => (
                <tr key={o.id} style={{ background: "#fef2f2" }}>
                  <td style={{ fontWeight: 500 }}>{o.gigs?.title ?? "Unknown"}</td>
                  <td>{o.profiles?.name ?? "Unknown"}</td>
                  <td><span className="status-badge disputed">disputed</span></td>
                  <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="btn btn-primary"
                      style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}
                    >
                      Review & Resolve
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Gig</th>
            <th>Buyer</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {others.map((o: any) => (
            <tr key={o.id}>
              <td>{o.gigs?.title ?? "Unknown"}</td>
              <td>{o.profiles?.name ?? "Unknown"}</td>
              <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
              <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {new Date(o.created_at).toLocaleDateString()}
              </td>
              <td>
                <Link
                  href={`/admin/orders/${o.id}`}
                  style={{ fontSize: "0.8rem", color: "var(--foreground)", textDecoration: "none" }}
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
          {(!others || others.length === 0) && (
            <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>No orders yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
