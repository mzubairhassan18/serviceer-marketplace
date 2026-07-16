import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Heart, MapPin, Sparkles, Star } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface GigCardProps {
  gig: any;
  showTags?: boolean;
  view?: "grid" | "list";
}

const categoryClass: Record<string, string> = {
  plumbing: "visual-blue", electrical: "visual-yellow", painting: "visual-coral",
  cleaning: "visual-mint", carpentry: "visual-sand", security: "visual-violet",
  construction: "visual-orange",
};

export function GigCard({ gig, showTags = false, view = "grid" }: GigCardProps) {
  const featured = gig.featured_until && new Date(gig.featured_until) > new Date();
  const rating = gig.avg_rating ?? 0;
  const visual = categoryClass[gig.category?.toLowerCase()] ?? "visual-blue";
  const initials = (gig.profiles?.name ?? "Serviceer").split(" ").map((part: string) => part[0]).slice(0, 2).join("");

  return (
    <article className={`service-card ${view === "list" ? "service-card-list" : ""} ${featured ? "is-featured" : ""}`}>
      <Link href={`/gigs/${gig.id}`} className={`service-visual ${visual}`} aria-label={gig.title}>
        <span className="service-category">{gig.category || "Local service"}</span>
        <span className="service-visual-mark">{gig.title.charAt(0)}</span>
        {featured && <span className="service-featured"><Sparkles size={13} /> Top pick</span>}
        <span className="service-open"><ArrowUpRight size={18} /></span>
      </Link>
      <button className="service-save" type="button" aria-label="Save service"><Heart size={18} /></button>
      <div className="service-content">
        <div className="provider-line">
          <span className="provider-avatar">{initials}</span>
          <span>{gig.profiles?.name ?? "Verified professional"}</span>
          <BadgeCheck size={15} className="verified-icon" aria-label="Verified" />
        </div>
        <Link href={`/gigs/${gig.id}`} className="service-title">{gig.title}</Link>
        {showTags && gig.tags?.length > 0 && <p className="service-tags">{gig.tags.slice(0, 3).join(" · ")}</p>}
        <div className="service-meta">
          <span className="service-rating"><Star size={14} fill="currentColor" />{rating > 0 ? rating.toFixed(1) : "New"}{rating > 0 && <small>({gig.review_count})</small>}</span>
          {gig.location && <span className="service-location"><MapPin size={13} />{gig.location}</span>}
        </div>
        <div className="service-footer">
          <span>Starting from</span>
          <strong>{formatPrice(gig.price)}</strong>
        </div>
      </div>
    </article>
  );
}
