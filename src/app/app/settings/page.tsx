import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function SettingsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Settings</h1>

      <div className="card" style={{ maxWidth: "500px" }}>
        <h2 style={{ fontWeight: 600, marginBottom: "1rem" }}>Profile</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="auth-field">
            <label>Name</label>
            <input type="text" defaultValue={profile?.name ?? ""} readOnly style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }} />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input type="email" defaultValue={user?.email ?? ""} readOnly style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }} />
          </div>
          <div className="auth-field">
            <label>Role</label>
            <input type="text" defaultValue={profile?.role ?? ""} readOnly style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }} />
          </div>
          <div className="auth-field">
            <label>Phone</label>
            <input type="tel" defaultValue={profile?.phone ?? ""} readOnly style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
