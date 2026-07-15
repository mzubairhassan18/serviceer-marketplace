"use client";

import Link from "next/link";
import { useState } from "react";
import { HeroSearch } from "@/components/hero-search";
import { GigCard } from "@/components/gig-card";
import { ViewToggle } from "@/components/view-toggle";

interface GigWithStats {
  id: string;
  title: string;
  price: number;
  location: string;
  tags: string[];
  featured_until: string | null;
  profiles: { name: string } | null;
  avg_rating: number;
  review_count: number;
}

export function HomePageClient({ featuredGigs, otherGigs }: { featuredGigs: GigWithStats[]; otherGigs: GigWithStats[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");

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

      <div className="container" style={{ paddingTop: "2rem" }}>
        {featuredGigs.length > 0 && (
          <section style={{ marginBottom: "2.5rem" }}>
            <div className="section-header">
              <h2 className="section-title">Featured</h2>
            </div>
            <div className={view === "grid" ? "gig-grid" : "gig-list"}>
              {featuredGigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} view={view} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="section-header">
            <h2 className="section-title">All Services</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ViewToggle onChange={setView} />
            </div>
          </div>
          {otherGigs.length === 0 && featuredGigs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "var(--muted-foreground)" }}>No gigs available yet.</p>
            </div>
          ) : otherGigs.length === 0 ? (
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>No other gigs listed.</p>
          ) : (
            <div className={view === "grid" ? "gig-grid" : "gig-list"}>
              {otherGigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} view={view} />
              ))}
            </div>
          )}
        </section>
      </div>

      <section style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--muted)", marginTop: "3rem" }}>
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
