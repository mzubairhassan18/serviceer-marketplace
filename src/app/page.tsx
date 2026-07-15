import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/format";
import { HeroSearch } from "@/components/hero-search";

export default async function HomePage() {
  const supabase = createClient(await cookies());

  const { data: featuredGigs } = await supabase
    .from("gigs")
    .select("*, profiles!provider_id(name)")
    .eq("status", "approved")
    .order("featured_until", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(8);

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
            {featuredGigs.map((gig: any) => (
              <Link key={gig.id} href={`/gigs/${gig.id}`} className="gig-card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="gig-card-image" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)" }}>
                  {gig.title.charAt(0)}
                </div>
                <div className="gig-card-body">
                  {gig.featured_until && new Date(gig.featured_until) > new Date() && (
                    <span className="featured-badge">Featured</span>
                  )}
                  <h3 style={{ fontWeight: 600, marginTop: "0.25rem" }}>{gig.title}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{gig.profiles?.name ?? "Provider"}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                    <span style={{ fontWeight: 600 }}>{formatPrice(gig.price)}</span>
                  </div>
                </div>
              </Link>
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
