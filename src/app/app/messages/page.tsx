import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function MessagesPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, gigs!gig_id(title), status, profiles!buyer_id(name)")
    .or(`buyer_id.eq.${user!.id},provider_id.eq.${user!.id}`)
    .order("updated_at", { ascending: false });

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Messages</h1>

      {(!orders || orders.length === 0) ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--muted-foreground)" }}>No conversations yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {orders.map((o: any) => (
            <Link key={o.id} href={`/app/messages/${o.id}`} className="card" style={{ textDecoration: "none", color: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 500 }}>{o.gigs?.title ?? "Unknown"}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{o.profiles?.name ?? "Unknown"}</div>
              </div>
              <span className={`status-badge`}>{o.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
