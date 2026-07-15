import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendContactAction } from "./actions";

export default async function ContactPage(props: { searchParams: Promise<{ gigId: string; providerId: string }> }) {
  const { gigId, providerId } = await props.searchParams;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: gig } = await supabase.from("gigs").select("title").eq("id", gigId).single();

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" }}>
      <div className="card">
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Contact Provider</h1>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          Regarding: {gig?.title ?? "Service"}
        </p>

        {!user ? (
          <div className="auth-card" style={{ margin: 0 }}>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
              Please sign in to contact the provider.
            </p>
            <a href="/sign-in" className="btn btn-primary" style={{ textDecoration: "none" }}>Sign in</a>
          </div>
        ) : (
          <form action={sendContactAction} className="auth-form">
            <input type="hidden" name="gigId" value={gigId} />
            <input type="hidden" name="providerId" value={providerId} />
            <div className="auth-field">
              <label htmlFor="message">Your message</label>
              <textarea id="message" name="message" rows={5} required placeholder="Describe what you need..." style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", resize: "vertical" }} />
            </div>
            <div className="auth-field">
              <label htmlFor="phone">Your phone number (optional)</label>
              <input id="phone" name="phone" type="tel" placeholder="03XX-XXXXXXX" style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }} />
            </div>
            <button className="auth-submit" type="submit">Send inquiry</button>
          </form>
        )}
      </div>
    </div>
  );
}
