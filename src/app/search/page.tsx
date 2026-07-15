import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { GigCard } from "@/components/gig-card";

export default async function SearchPage(props: { searchParams: Promise<{ q: string }> }) {
  const { q } = await props.searchParams;
  const supabase = createClient(await cookies());

  let gigs: any[] = [];

  if (q) {
    const query = `%${q}%`;
    const { data } = await supabase
      .from("gigs")
      .select("*, profiles!provider_id(name)")
      .eq("status", "approved")
      .or(`title.ilike.${query},description.ilike.${query},category.ilike.${query},tags.cs.{${q}}`)
      .order("created_at", { ascending: false })
      .limit(50);

    gigs = data ?? [];
  }

  // Fetch review stats
  let gigStats: Record<string, { avg: number; count: number }> = {};
  if (gigs.length > 0) {
    const gigIds = gigs.map((g) => g.id);
    const { data: reviews } = await supabase
      .from("reviews")
      .select("gig_id, rating")
      .in("gig_id", gigIds);

    if (reviews) {
      const grouped: Record<string, number[]> = {};
      for (const r of reviews as any[]) {
        if (!grouped[r.gig_id]) grouped[r.gig_id] = [];
        grouped[r.gig_id].push(r.rating);
      }
      for (const [gigId, ratings] of Object.entries(grouped)) {
        gigStats[gigId] = {
          avg: ratings.reduce((a, b) => a + b, 0) / ratings.length,
          count: ratings.length,
        };
      }
    }
  }

  const enrichedGigs = gigs.map((g) => ({
    ...g,
    avg_rating: gigStats[g.id]?.avg ?? 0,
    review_count: gigStats[g.id]?.count ?? 0,
  }));

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
        {enrichedGigs.map((gig: any) => (
          <GigCard key={gig.id} gig={gig} />
        ))}
      </div>
    </div>
  );
}
