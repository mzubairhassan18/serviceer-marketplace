import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Plus } from "lucide-react";

export default async function MyGigsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: gigs } = await supabase
    .from("gigs")
    .select("*")
    .eq("providerId", user!.id)
    .order("createdAt", { ascending: false });

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
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gigs.map((gig: any) => (
              <tr key={gig.id}>
                <td style={{ fontWeight: 500 }}>{gig.title}</td>
                <td>{gig.category}</td>
                <td>Rs. {gig.price}</td>
                <td><span className={`status-badge ${gig.status}`}>{gig.status}</span></td>
                <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                  {new Date(gig.createdAt).toLocaleDateString()}
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
