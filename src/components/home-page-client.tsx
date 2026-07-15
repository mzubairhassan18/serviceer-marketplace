"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { HeroSearch } from "@/components/hero-search";
import { GigCard } from "@/components/gig-card";
import { ViewToggle } from "@/components/view-toggle";

interface GigWithStats {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  tags: string[];
  featured_until: string | null;
  profiles: { name: string } | null;
  avg_rating: number;
  review_count: number;
}

export function HomePageClient({ allGigs }: { allGigs: GigWithStats[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const isFiltering = q.trim() || category;

  const filteredGigs = useMemo(() => {
    let result = allGigs;

    if (category) {
      result = result.filter((g) => g.category?.toLowerCase() === category.toLowerCase());
    }

    if (q.trim()) {
      const query = q.trim().toLowerCase();
      result = result.filter((g) =>
        g.title.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.category?.toLowerCase().includes(query) ||
        g.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    return result;
  }, [allGigs, q, category]);

  const featuredFiltered = filteredGigs.filter((g) => g.featured_until && new Date(g.featured_until) > new Date());
  const otherFiltered = filteredGigs.filter((g) => !g.featured_until || new Date(g.featured_until) <= new Date());

  // When not filtering, show all gigs grouped
  const allFeatured = allGigs.filter((g) => g.featured_until && new Date(g.featured_until) > new Date());
  const allOther = allGigs.filter((g) => !g.featured_until || new Date(g.featured_until) <= new Date());

  // Group other gigs by category when not filtering
  const categoryGroups = useMemo(() => {
    const source = isFiltering ? otherFiltered : allOther;
    const groups: Record<string, GigWithStats[]> = {};
    for (const gig of source) {
      const cat = gig.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(gig);
    }
    return groups;
  }, [allOther, otherFiltered, isFiltering]);

  const displayFeatured = isFiltering ? featuredFiltered : allFeatured;
  const hasResults = filteredGigs.length > 0;

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

      <div className="container" style={{ paddingTop: "1.5rem" }}>
        {/* View toggle — always at top */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
          <ViewToggle onChange={setView} />
        </div>

        {/* Search results header */}
        {isFiltering && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                {category && `"${category.charAt(0).toUpperCase() + category.slice(1)}"`}
                {category && q && " — "}
                {q && `"${q}"`}
              </h2>
              <Link href="/" style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none" }}>
                Clear filters
              </Link>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
              {filteredGigs.length} {filteredGigs.length === 1 ? "service" : "services"} found
            </p>
          </div>
        )}

        {/* Featured gigs */}
        {displayFeatured.length > 0 && (
          <section style={{ marginBottom: "2rem" }}>
            <div className="section-header" style={{ padding: 0, marginBottom: "1rem" }}>
              <h2 className="section-title">{isFiltering ? "Featured Results" : "Featured"}</h2>
            </div>
            <div className={view === "grid" ? "gig-grid" : "gig-list"}>
              {displayFeatured.map((gig) => (
                <GigCard key={gig.id} gig={gig} view={view} />
              ))}
            </div>
          </section>
        )}

        {/* Category groups or filtered results */}
        {isFiltering ? (
          // Filtered: show non-featured results
          otherFiltered.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <div className="section-header" style={{ padding: 0, marginBottom: "1rem" }}>
                <h2 className="section-title">Other Results</h2>
              </div>
              <div className={view === "grid" ? "gig-grid" : "gig-list"}>
                {otherFiltered.map((gig) => (
                  <GigCard key={gig.id} gig={gig} view={view} />
                ))}
              </div>
            </section>
          )
        ) : (
          // Not filtering: show by category
          Object.entries(categoryGroups).map(([cat, gigs]) => (
            <section key={cat} style={{ marginBottom: "2rem" }}>
              <div className="section-header" style={{ padding: 0, marginBottom: "1rem" }}>
                <h2 className="section-title">{cat}</h2>
                {gigs.length > 4 && (
                  <Link
                    href={`/?category=${cat.toLowerCase()}`}
                    style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none" }}
                  >
                    View all
                  </Link>
                )}
              </div>
              <div className={view === "grid" ? "gig-grid" : "gig-list"}>
                {gigs.slice(0, 4).map((gig) => (
                  <GigCard key={gig.id} gig={gig} view={view} />
                ))}
              </div>
            </section>
          ))
        )}

        {/* Empty state */}
        {isFiltering && !hasResults && (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "1rem" }}>
              No services found for this search.
            </p>
            <Link href="/" className="btn btn-primary" style={{ textDecoration: "none" }}>
              Browse all services
            </Link>
          </div>
        )}

        {!isFiltering && allGigs.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--muted-foreground)" }}>No gigs available yet.</p>
          </div>
        )}
      </div>

      <section style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--muted)", marginTop: "2rem" }}>
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
