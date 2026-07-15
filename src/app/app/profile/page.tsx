import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { upsertProviderProfileAction } from "./actions";

export default async function ProviderProfilePage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: providerProfile } = await supabase
    .from("provider_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const skills = (providerProfile?.skills ?? []).join(", ");

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        Provider Profile
      </h1>

      <div className="card" style={{ maxWidth: "600px" }}>
        <form action={upsertProviderProfileAction} className="auth-form">
          <div className="auth-field">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={providerProfile?.bio ?? ""}
              placeholder="Tell clients about yourself..."
              style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", resize: "vertical" }}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="skills">Skills (comma separated)</label>
            <input
              id="skills"
              name="skills"
              type="text"
              defaultValue={skills}
              placeholder="plumbing, electrical, repair"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="years_experience">Years of Experience</label>
            <input
              id="years_experience"
              name="years_experience"
              type="number"
              min={0}
              defaultValue={providerProfile?.years_experience ?? 0}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="url"
              defaultValue={providerProfile?.website ?? ""}
              placeholder="https://example.com"
            />
          </div>

          <button className="auth-submit" type="submit">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
