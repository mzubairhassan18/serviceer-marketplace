import Link from "next/link";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface GigCardProps {
  gig: any;
  showTags?: boolean;
  view?: "grid" | "list";
}

export function GigCard({ gig, showTags = false, view = "grid" }: GigCardProps) {
  const isFeatured = gig.featured_until && new Date(gig.featured_until) > new Date();
  const avgRating = gig.avg_rating ?? 0;
  const reviewCount = gig.review_count ?? 0;

  if (view === "list") {
    return (
      <Link href={`/gigs/${gig.id}`} className={`gig-list-item${isFeatured ? " featured" : ""}`}>
        <div className="gig-list-thumb">
          {gig.title.charAt(0)}
        </div>
        <div className="gig-list-info">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              {isFeatured && <span className="featured-badge">Featured</span>}
              <h3 className="gig-card-title" style={{ WebkitLineClamp: "unset" }}>{gig.title}</h3>
            </div>
            <p className="gig-card-provider">{gig.profiles?.name ?? "Provider"}</p>
            {showTags && gig.tags && gig.tags.length > 0 && (
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
                {gig.tags.slice(0, 3).map((t: string) => `#${t}`).join(" ")}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
            <span className="gig-card-price" style={{ marginTop: 0 }}>{formatPrice(gig.price)}</span>
            {avgRating > 0 && (
              <div className="gig-card-rating">
                <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                {avgRating.toFixed(1)}
                <span>({reviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/gigs/${gig.id}`} className={`gig-card${isFeatured ? " featured" : ""}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="gig-card-image" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)", fontSize: "2rem" }}>
        {gig.title.charAt(0)}
      </div>
      <div className="gig-card-body">
        {isFeatured && <span className="featured-badge">Featured</span>}
        <h3 className="gig-card-title">{gig.title}</h3>
        <p className="gig-card-provider">{gig.profiles?.name ?? "Provider"}</p>
        {showTags && gig.tags && gig.tags.length > 0 && (
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
            {gig.tags.slice(0, 3).map((t: string) => `#${t}`).join(" ")}
          </p>
        )}
        {avgRating > 0 && (
          <div className="gig-card-rating">
            <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
            {avgRating.toFixed(1)}
            <span>({reviewCount})</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
          <span className="gig-card-price" style={{ marginTop: 0 }}>{formatPrice(gig.price)}</span>
          {gig.location && (
            <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{gig.location}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
