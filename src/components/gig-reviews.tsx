import { Star } from "lucide-react";
import { firstRelation } from "@/lib/supabase-relations";

interface ReviewAuthor { name: string; }
interface GigReview { id: string; rating: number; body: string | null; created_at: string; reviewer: ReviewAuthor | ReviewAuthor[] | null; }

export function GigReviews({ reviews }: { reviews: GigReview[] }) {
  if (!reviews.length) return <div className="gig-empty-reviews"><Star /><strong>Be the first to review</strong><p>Reviews appear after a completed order.</p></div>;
  return <div className="gig-review-list">{reviews.map((review) => {
    const author = firstRelation(review.reviewer);
    return <article key={review.id}><div className="gig-review-head"><span>{(author?.name ?? "A").charAt(0)}</span><div><strong>{author?.name ?? "Anonymous"}</strong><small>{new Date(review.created_at).toLocaleDateString()}</small></div><b>{review.rating.toFixed(1)} <Star size={13} fill="currentColor" /></b></div>{review.body && <p>{review.body}</p>}</article>;
  })}</div>;
}
