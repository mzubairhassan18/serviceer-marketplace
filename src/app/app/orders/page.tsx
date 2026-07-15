import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/format";

export default async function OrdersPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, gigs!gig_id(title), buyer:profiles!buyer_id(name), provider:profiles!provider_id(name)")
    .or(`buyer_id.eq.${user!.id},provider_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  const isProvider = (o: any) => o.provider_id === user!.id;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Orders</h1>

      {(!orders || orders.length === 0) ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--muted-foreground)" }}>No orders yet.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Gig</th>
              <th>{isProvider(orders[0]) ? "Buyer" : "Provider"}</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 500 }}>{o.gigs?.title ?? "Unknown"}</td>
                <td style={{ fontSize: "0.875rem" }}>
                  {isProvider(o) ? (o.buyer?.name ?? "Unknown") : (o.provider?.name ?? "Unknown")}
                </td>
                <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                <td style={{ fontSize: "0.875rem" }}>
                  {o.offered_price ? formatPrice(o.offered_price) : "-"}
                </td>
                <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
                <td>
                  <Link href={`/app/orders/${o.id}`} className="btn btn-sm" style={{ textDecoration: "none" }}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
