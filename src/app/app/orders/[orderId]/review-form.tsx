"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ReviewFormProps {
  orderId: string;
  gigId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ orderId, gigId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a rating");
      return;
    }
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      order_id: orderId,
      gig_id: gigId,
      reviewer_id: user.id,
      rating,
      body: body.trim(),
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
    onSuccess?.();
  }

  if (submitted) {
    return (
      <div className="auth-message" style={{ textAlign: "center", padding: "1.5rem" }}>
        Thank you! Your review has been submitted.
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Leave a Review</h3>
      {error && <div className="auth-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label>Rating</label>
          <div style={{ display: "flex", gap: "4px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHovered(i + 1)}
                onMouseLeave={() => setHovered(0)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
              >
                <Star
                  size={24}
                  fill={(hovered || rating) > i ? "var(--primary)" : "none"}
                  stroke={(hovered || rating) > i ? "var(--primary)" : "var(--muted-foreground)"}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor="review-body">Your review (optional)</label>
          <textarea
            id="review-body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience..."
            style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", resize: "vertical" }}
          />
        </div>
        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
