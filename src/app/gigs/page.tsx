import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Search } from "lucide-react";

export default async function BrowseGigsPage(props: { searchParams: Promise<{ q?: string; category?: string; tag?: string }> }) {
  const { q, category, tag } = await props.searchParams;
  const supabase = createClient(await cookies());

  let query = supabase.from("gigs").select("*, profiles!provider_id(name)").eq("status", "approved");

  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);

  const { data: gigs } = await query.order("createdAt", { ascending: false });

  return (
    <div>
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Services` : "All Gigs"}
          </h1>
        </div>

        {(!gigs || gigs.length === 0) ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--muted-foreground)" }}>No gigs found. Try a different search.</p>
          </div>
        ) : (
          <div className="gig-grid" style={{ padding: 0 }}>
            {gigs.map((gig: any) => (
              <Link key={gig.id} href={`/gigs/${gig.id}`} className="gig-card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="gig-card-image" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)", fontSize: "2rem" }}>
                  {gig.title.charAt(0)}
                </div>
                <div className="gig-card-body">
                  {gig.featuredUntil && new Date(gig.featuredUntil) > new Date() && (
                    <span className="featured-badge">Featured</span>
                  )}
                  <h3 style={{ fontWeight: 600, marginTop: "0.25rem" }}>{gig.title}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{gig.profiles?.name ?? "Provider"}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
                    {gig.tags?.slice(0, 3).map((t: string) => `#${t}`).join(" ")}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                    <span style={{ fontWeight: 600 }}>Rs. {gig.price}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{gig.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
