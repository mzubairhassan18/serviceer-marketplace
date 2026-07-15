import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { approveGigAction, rejectGigAction } from "./actions";

export default async function AdminGigsPage() {
  const supabase = createClient(await cookies());
  const { data: gigs } = await supabase
    .from("gigs")
    .select("*, profiles!provider_id(name)")
    .order("createdAt", { ascending: false });

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Manage Gigs</h1>

      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Provider</th>
            <th>Category</th>
            <th>Price</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {gigs?.map((gig: any) => (
            <tr key={gig.id}>
              <td style={{ fontWeight: 500 }}>{gig.title}</td>
              <td>{gig.profiles?.name ?? "Unknown"}</td>
              <td>{gig.category}</td>
              <td>Rs. {gig.price}</td>
              <td><span className={`status-badge ${gig.status}`}>{gig.status}</span></td>
              <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {new Date(gig.createdAt).toLocaleDateString()}
              </td>
              <td>
                {gig.status === "pending" && (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <form action={approveGigAction}>
                      <input type="hidden" name="gigId" value={gig.id} />
                      <button type="submit" className="btn btn-sm" style={{ background: "#15803d", color: "white", border: "none" }}>Approve</button>
                    </form>
                    <form action={rejectGigAction}>
                      <input type="hidden" name="gigId" value={gig.id} />
                      <button type="submit" className="btn btn-sm" style={{ background: "#dc2626", color: "white", border: "none" }}>Reject</button>
                    </form>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {(!gigs || gigs.length === 0) && (
            <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "2rem" }}>No gigs yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
