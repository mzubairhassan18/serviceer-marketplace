import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { GigBoostButton } from "@/components/gig-boost-button";

export default async function MyGigsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: gigs } = await supabase
    .from("gigs")
    .select("*")
    .eq("provider_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: subscriptions } = await supabase
    .from("provider_subscriptions")
    .select("id, status, end_date, ad_packages(name, max_gigs)")
    .eq("provider_id", user!.id)
    .order("created_at", { ascending: false });

  const activeSubscription = subscriptions?.find(
    (s: any) => s.status === "active" && new Date(s.end_date) > new Date()
  ) ?? null;

  const gigIds = gigs?.map((g: any) => g.id) ?? [];
  let boostMap: Record<string, any> = {};
  if (gigIds.length > 0) {
    const { data: boosts } = await supabase
      .from("gig_boosts")
      .select("id, gig_id, status, subscription_id")
      .in("gig_id", gigIds)
      .in("status", ["pending", "approved"]);
    boosts?.forEach((b: any) => { boostMap[b.gig_id] = b; });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>My Gigs</h1>
        <Link href="/app/gigs/create" className="btn btn-primary" style={{ textDecoration: "none" }}>
          <Plus size={16} /> New Gig
        </Link>
      </div>

      {(!gigs || gigs.length === 0) ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--muted-foreground)", marginBottom: "1rem" }}>You haven&apos;t created any gigs yet.</p>
          <Link href="/app/gigs/create" className="btn btn-primary" style={{ textDecoration: "none" }}>Create Your First Gig</Link>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Boost</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gigs.map((gig: any) => (
              <tr key={gig.id}>
                <td style={{ fontWeight: 500 }}>{gig.title}</td>
                <td>{gig.category}</td>
                <td>{formatPrice(gig.price)}</td>
                <td><span className={`status-badge ${gig.status}`}>{gig.status}</span></td>
                <td>
                  {gig.status === "approved" ? (
                    <GigBoostButton
                      gigId={gig.id}
                      activeSubscription={activeSubscription}
                      existingBoost={boostMap[gig.id] ?? null}
                    />
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>—</span>
                  )}
                </td>
                <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                  {new Date(gig.created_at).toLocaleDateString()}
                </td>
                <td>
                  <Link href={`/app/gigs/${gig.id}/edit`} className="btn btn-sm" style={{ textDecoration: "none" }}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
