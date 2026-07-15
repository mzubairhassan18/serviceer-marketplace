import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function GigDetailPage(props: { params: Promise<{ gigId: string }> }) {
  const { gigId } = await props.params;
  const supabase = createClient(await cookies());

  const { data: gig } = await supabase
    .from("gigs")
    .select("*, profiles!provider_id(name, email, phone)")
    .eq("id", gigId)
    .single();

  if (!gig) notFound();

  const isFeatured = gig.featured_until && new Date(gig.featured_until) > new Date();

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
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>Rs. {gig.price}</div>
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
          <p style={{ fontWeight: 500 }}>{gig.profiles?.name}</p>
          <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{gig.location}</p>

          <Link href={`/contact?gigId=${gig.id}&providerId=${gig.provider_id}`} className="btn btn-primary" style={{ textDecoration: "none", display: "inline-block", marginTop: "1rem" }}>
            Contact Provider
          </Link>
        </div>
      </div>
    </div>
  );
}
