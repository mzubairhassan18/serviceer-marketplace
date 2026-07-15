import Link from "next/link";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface GigCardProps {
  gig: any;
  showTags?: boolean;
}

export function GigCard({ gig, showTags = false }: GigCardProps) {
  const isFeatured = gig.featured_until && new Date(gig.featured_until) > new Date();
  const avgRating = gig.avg_rating ?? 0;
  const reviewCount = gig.review_count ?? 0;

  return (
    <Link href={`/gigs/${gig.id}`} className="gig-card" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="gig-card-image" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)", fontSize: "2rem" }}>
        {gig.title.charAt(0)}
      </div>
      <div className="gig-card-body">
        {isFeatured && <span className="featured-badge">Featured</span>}
        <h3 style={{ fontWeight: 600, marginTop: "0.25rem" }}>{gig.title}</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{gig.profiles?.name ?? "Provider"}</p>
        {showTags && gig.tags && gig.tags.length > 0 && (
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
            {gig.tags.slice(0, 3).map((t: string) => `#${t}`).join(" ")}
          </p>
        )}
        {avgRating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.35rem" }}>
            <div style={{ display: "flex", gap: "1px" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.round(avgRating) ? "#f59e0b" : "none"}
                  stroke={i < Math.round(avgRating) ? "#f59e0b" : "var(--muted-foreground)"}
                />
              ))}
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>{avgRating.toFixed(1)}</span>
            <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>({reviewCount})</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
          <span style={{ fontWeight: 600 }}>{formatPrice(gig.price)}</span>
          {gig.location && (
            <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{gig.location}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
