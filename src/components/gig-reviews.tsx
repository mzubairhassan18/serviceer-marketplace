import { Star } from "lucide-react";

interface GigReview { id: string; rating: number; body: string | null; created_at: string; reviewer: { name: string } | null; }

export function GigReviews({ reviews }: { reviews: GigReview[] }) {
  if (!reviews.length) return <div className="gig-empty-reviews"><Star /><strong>Be the first to review</strong><p>Reviews appear after a completed order.</p></div>;
  return <div className="gig-review-list">{reviews.map((review) => <article key={review.id}><div className="gig-review-head"><span>{(review.reviewer?.name ?? "A").charAt(0)}</span><div><strong>{review.reviewer?.name ?? "Anonymous"}</strong><small>{new Date(review.created_at).toLocaleDateString()}</small></div><b>{review.rating.toFixed(1)} <Star size={13} fill="currentColor" /></b></div>{review.body && <p>{review.body}</p>}</article>)}</div>;
}
