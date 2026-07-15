import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { HomePageClient } from "@/components/home-page-client";

export default async function HomePage() {
  const supabase = createClient(await cookies());

  const { data: allGigs } = await supabase
    .from("gigs")
    .select("*, profiles!provider_id(name)")
    .eq("status", "approved")
    .order("featured_until", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch review stats
  let gigStats: Record<string, { avg: number; count: number }> = {};
  if (allGigs && allGigs.length > 0) {
    const gigIds = allGigs.map((g: any) => g.id);
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

  const enrichedGigs = (allGigs ?? []).map((g: any) => ({
    ...g,
    avg_rating: gigStats[g.id]?.avg ?? 0,
    review_count: gigStats[g.id]?.count ?? 0,
  }));

  return <HomePageClient allGigs={enrichedGigs} />;
}
