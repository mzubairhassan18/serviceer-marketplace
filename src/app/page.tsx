import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { HeroSearch } from "@/components/hero-search";
import { GigCard } from "@/components/gig-card";

export default async function HomePage() {
  const supabase = createClient(await cookies());

  const { data: featuredGigs } = await supabase
    .from("gigs")
    .select("*, profiles!provider_id(name)")
    .eq("status", "approved")
    .order("featured_until", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(8);

  // Fetch review stats for all gigs
  let gigStats: Record<string, { avg: number; count: number }> = {};
  if (featuredGigs && featuredGigs.length > 0) {
    const gigIds = featuredGigs.map((g: any) => g.id);
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

  const enrichedGigs = (featuredGigs ?? []).map((g: any) => ({
    ...g,
    avg_rating: gigStats[g.id]?.avg ?? 0,
    review_count: gigStats[g.id]?.count ?? 0,
  }));

  return (
    <div>
      <section className="marketplace-hero">
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          What service do you need?
        </h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.8, marginBottom: "1.5rem" }}>
          Find trusted professionals for any job
        </p>
        <HeroSearch />
      </section>

      <section>
        <div className="section-header">
          <h2 className="section-title">Featured Gigs</h2>
          <Link href="/gigs" style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>View all</Link>
        </div>
        {(!featuredGigs || featuredGigs.length === 0) ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--muted-foreground)" }}>No gigs available yet.</p>
          </div>
        ) : (
          <div className="gig-grid">
            {enrichedGigs.map((gig: any) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </section>

      <section style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--muted)" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>Are you a service provider?</h2>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
          List your services, get featured, and start receiving orders today.
        </p>
        <Link href="/sign-up" className="btn btn-primary" style={{ textDecoration: "none" }}>
          Become a Provider
        </Link>
      </section>
    </div>
  );
}
