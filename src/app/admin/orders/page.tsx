import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function AdminOrdersPage() {
  const supabase = createClient(await cookies());
  const { data: orders } = await supabase
    .from("orders")
    .select("*, gigs!gig_id(title), profiles!buyer_id(name)")
    .order("createdAt", { ascending: false });

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>All Orders</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Gig</th>
            <th>Buyer</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((o: any) => (
            <tr key={o.id}>
              <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{o.id.slice(0, 8)}</td>
              <td>{o.gigs?.title ?? "Unknown"}</td>
              <td>{o.profiles?.name ?? "Unknown"}</td>
              <td><span className={`status-badge`}>{o.status}</span></td>
              <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {new Date(o.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {(!orders || orders.length === 0) && (
            <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>No orders yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
