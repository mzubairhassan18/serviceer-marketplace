import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function SearchPage(props: { searchParams: Promise<{ q: string }> }) {
  const { q } = await props.searchParams;
  const supabase = createClient(await cookies());

  let gigs: any[] = [];

  if (q) {
    const { data } = await supabase
      .from("gigs")
      .select("*, profiles!provider_id(name)")
      .eq("status", "approved")
      .textSearch("title", q, { config: "english" })
      .order("createdAt", { ascending: false });

    gigs = data ?? [];
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        {q ? `Results for "${q}"` : "Search Services"}
      </h1>

      {q && gigs.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--muted-foreground)" }}>No results found for &quot;{q}&quot;. Try different keywords.</p>
        </div>
      )}

      <div className="gig-grid" style={{ padding: 0 }}>
        {gigs.map((gig: any) => (
          <Link key={gig.id} href={`/gigs/${gig.id}`} className="gig-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="gig-card-image" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "var(--muted-foreground)" }}>
              {gig.title.charAt(0)}
            </div>
            <div className="gig-card-body">
              <h3 style={{ fontWeight: 600 }}>{gig.title}</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{gig.profiles?.name}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                <span style={{ fontWeight: 600 }}>Rs. {gig.price}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
