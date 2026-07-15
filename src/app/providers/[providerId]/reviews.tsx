import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  body: string;
  created_at: string;
  reviewer: { name: string } | null;
}

export function Reviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>No reviews yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {reviews.map((r) => (
        <div key={r.id} className="card" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{r.reviewer?.name ?? "Anonymous"}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
              {new Date(r.created_at).toLocaleDateString()}
            </span>
          </div>
          <div style={{ display: "flex", gap: "2px", marginBottom: "0.5rem" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < r.rating ? "var(--primary)" : "none"}
                stroke={i < r.rating ? "var(--primary)" : "var(--muted-foreground)"}
              />
            ))}
          </div>
          {r.body && (
            <p style={{ fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>{r.body}</p>
          )}
        </div>
      ))}
    </div>
  );
}
