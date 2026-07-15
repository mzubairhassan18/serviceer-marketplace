import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Search } from "lucide-react";
import { GigCard } from "@/components/gig-card";

export default async function BrowseGigsPage(props: { searchParams: Promise<{ q?: string; category?: string; tag?: string }> }) {
  const { q, category, tag } = await props.searchParams;
  const supabase = createClient(await cookies());

  let query = supabase.from("gigs").select("*, profiles!provider_id(name)").eq("status", "approved");

  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);

  const { data: gigs } = await query.order("created_at", { ascending: false });

  // Fetch review stats
  let gigStats: Record<string, { avg: number; count: number }> = {};
  if (gigs && gigs.length > 0) {
    const gigIds = gigs.map((g: any) => g.id);
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

  const enrichedGigs = (gigs ?? []).map((g: any) => ({
    ...g,
    avg_rating: gigStats[g.id]?.avg ?? 0,
    review_count: gigStats[g.id]?.count ?? 0,
  }));

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
            {enrichedGigs.map((gig: any) => (
              <GigCard key={gig.id} gig={gig} showTags />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
