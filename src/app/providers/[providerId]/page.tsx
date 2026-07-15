import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/format";
import { ExternalLink } from "lucide-react";
import { Reviews } from "./reviews";

export default async function ProviderProfileViewPage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;
  const supabase = createClient(await cookies());

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", providerId)
    .single();

  if (!profile) notFound();

  const { data: providerProfile } = await supabase
    .from("provider_profiles")
    .select("*")
    .eq("id", providerId)
    .maybeSingle();

  const { data: gigs } = await supabase
    .from("gigs")
    .select("id, title, category, price, currency, tags, description")
    .eq("provider_id", providerId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const gigIds = (gigs ?? []).map((g) => g.id);

  let reviews: any[] = [];
  if (gigIds.length > 0) {
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, body, created_at, reviewer:profiles!reviews_reviewer_id_profiles_id_fk(name)")
      .in("gig_id", gigIds)
      .order("created_at", { ascending: false });
    reviews = data ?? [];
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        {profile.name}
      </h1>

      <div className="card" style={{ marginBottom: "1.5rem", padding: "1.5rem" }}>
        {providerProfile?.bio && (
          <p style={{ fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1rem" }}>
            {providerProfile.bio}
          </p>
        )}

        {providerProfile?.skills && providerProfile.skills.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.5rem" }}>Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {providerProfile.skills.map((skill: string) => (
                <span key={skill} className="status-badge">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {providerProfile?.years_experience != null && providerProfile.years_experience > 0 && (
          <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
            {providerProfile.years_experience} years of experience
          </p>
        )}

        {providerProfile?.website && (
          <a
            href={providerProfile.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.9rem", color: "var(--primary)" }}
          >
            <ExternalLink size={14} /> {providerProfile.website}
          </a>
        )}
      </div>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Gigs</h2>
      {gigs && gigs.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
          {gigs.map((gig) => (
            <div key={gig.id} className="card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>{gig.title}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
                    {gig.category}
                  </p>
                </div>
                <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{formatPrice(gig.price)}</span>
              </div>
              {gig.tags && gig.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {gig.tags.map((tag: string) => (
                    <span key={tag} className="status-badge">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", marginBottom: "2rem" }}>No active gigs.</p>
      )}

      <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Reviews</h2>
      <Reviews reviews={reviews} />
    </div>
  );
}
