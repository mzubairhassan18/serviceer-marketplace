import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/format";

const categories = [
  { name: "Plumbing", icon: "Wrench", color: "#3b82f6" },
  { name: "Electrical", icon: "Zap", color: "#f59e0b" },
  { name: "Painting", icon: "PaintBucket", color: "#10b981" },
  { name: "Cleaning", icon: "Spray", color: "#8b5cf6" },
  { name: "Carpentry", icon: "Brush", color: "#f97316" },
  { name: "Security", icon: "Shield", color: "#ef4444" },
  { name: "Construction", icon: "HardHat", color: "#6366f1" },
  { name: "More", icon: "Search", color: "#64748b" },
];

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
        <div className="search-bar">
          <input type="text" placeholder="Search for a service..." />
          <Link href="/search" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", textDecoration: "none" }}>
            <Search size={18} /> Search
          </Link>
        </div>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/gigs?tag=plumbing" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>Plumbing</Link>
          <Link href="/gigs?tag=electrical" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>Electrical</Link>
          <Link href="/gigs?tag=cleaning" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>Cleaning</Link>
          <Link href="/gigs?tag=painting" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>Painting</Link>
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2 className="section-title">Categories</h2>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link key={cat.name} href={`/gigs?category=${cat.name.toLowerCase()}`} className="category-card" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{cat.name.charAt(0)}</div>
              <div style={{ fontWeight: 500 }}>{cat.name}</div>
            </Link>
          ))}
        </div>
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
