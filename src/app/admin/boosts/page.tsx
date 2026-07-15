import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { approveBoostAction, rejectBoostAction } from "./actions";

export default async function AdminBoostsPage() {
  const supabase = createClient(await cookies());

  const { data: boosts } = await supabase
    .from("gig_boosts")
    .select(`
      id,
      status,
      created_at,
      profiles!provider_id(name),
      gigs!gig_id(title),
      provider_subscriptions!subscription_id(
        end_date,
        ad_packages(name)
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Manage Boosts</h1>

      <table className="data-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Gig</th>
            <th>Package</th>
            <th>Expiry</th>
            <th>Status</th>
            <th>Requested</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {boosts?.map((boost: any) => (
            <tr key={boost.id}>
              <td>{boost.profiles?.name ?? "Unknown"}</td>
              <td style={{ fontWeight: 500 }}>{boost.gigs?.title ?? "Unknown"}</td>
              <td>{boost.provider_subscriptions?.ad_packages?.name ?? "Unknown"}</td>
              <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {boost.provider_subscriptions?.end_date
                  ? new Date(boost.provider_subscriptions.end_date).toLocaleDateString()
                  : "—"}
              </td>
              <td><span className={`status-badge ${boost.status}`}>{boost.status}</span></td>
              <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {new Date(boost.created_at).toLocaleDateString()}
              </td>
              <td>
                {boost.status === "pending" && (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <form action={approveBoostAction}>
                      <input type="hidden" name="boostId" value={boost.id} />
                      <button type="submit" className="btn btn-sm" style={{ background: "#15803d", color: "white", border: "none" }}>Approve</button>
                    </form>
                    <form action={rejectBoostAction}>
                      <input type="hidden" name="boostId" value={boost.id} />
                      <button type="submit" className="btn btn-sm" style={{ background: "#dc2626", color: "white", border: "none" }}>Reject</button>
                    </form>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {(!boosts || boosts.length === 0) && (
            <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "2rem" }}>No boost requests yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
