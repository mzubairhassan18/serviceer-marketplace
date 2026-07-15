import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/format";
import { Star } from "lucide-react";
import { sendContactAction } from "@/app/contact/actions";

export default async function GigDetailPage(props: { params: Promise<{ gigId: string }> }) {
  const { gigId } = await props.params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: gig } = await supabase
    .from("gigs")
    .select("*, profiles!provider_id(name, email, phone)")
    .eq("id", gigId)
    .single();

  if (!gig) notFound();

  const isFeatured = gig.featured_until && new Date(gig.featured_until) > new Date();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, body, created_at, reviewer:profiles!reviews_reviewer_id_profiles_id_fk(name)")
    .eq("gig_id", gigId)
    .order("created_at", { ascending: false });

  const isOwnGig = user?.id === gig.provider_id;

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" }}>
      <Link href="/gigs" style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", textDecoration: "none" }}>
        &larr; Back to gigs
      </Link>

      <div className="card" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{gig.title}</h1>
            {isFeatured && <span className="featured-badge" style={{ marginTop: "0.5rem" }}>Featured</span>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{formatPrice(gig.price)}</div>
          </div>
        </div>

        <p style={{ color: "var(--muted-foreground)", marginTop: "1rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {gig.description}
        </p>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          {gig.tags?.map((t: string) => (
            <Link key={t} href={`/gigs?tag=${t}`} style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", textDecoration: "none" }}>
              #{t}
            </Link>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", marginTop: "1.5rem", paddingTop: "1.5rem" }}>
          <h2 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Provider</h2>
          <Link href={`/providers/${gig.provider_id}`} style={{ fontWeight: 500, color: "var(--foreground)", textDecoration: "none" }}>
            {gig.profiles?.name}
          </Link>
          <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{gig.location}</p>
        </div>
      </div>

      {!isOwnGig && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h2 style={{ fontWeight: 600, marginBottom: "1rem" }}>Place an Order</h2>
          {!user ? (
            <div>
              <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                Sign in to place an order with this provider.
              </p>
              <a href="/sign-in" className="btn btn-primary" style={{ textDecoration: "none" }}>Sign in</a>
            </div>
          ) : (
            <form action={sendContactAction} className="auth-form">
              <input type="hidden" name="gigId" value={gig.id} />
              <input type="hidden" name="providerId" value={gig.provider_id} />
              <div className="auth-field">
                <label htmlFor="description">What do you need? *</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  required
                  placeholder="Describe the work you need done..."
                  style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", resize: "vertical" }}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="offered_price">Your budget (Rs) *</label>
                <input
                  id="offered_price"
                  name="offered_price"
                  type="number"
                  min="1"
                  required
                  placeholder="Enter amount in Rupees"
                  style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="phone">Phone number (optional)</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="message">Message to provider (optional)</label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  placeholder="Add any additional details..."
                  style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", resize: "vertical" }}
                />
              </div>
              <button className="auth-submit" type="submit">Send Inquiry</button>
            </form>
          )}
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Reviews</h2>
        {!reviews || reviews.length === 0 ? (
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>No reviews yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.map((r: any) => (
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
        )}
      </div>
    </div>
  );
}
