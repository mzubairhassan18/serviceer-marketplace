import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createGigAction } from "./actions";

export default async function CreateGigPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) redirect("/sign-in");

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Create a Gig</h1>
      <form action={createGigAction} className="auth-form">
        <div className="auth-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" required placeholder="e.g. Expert Plumbing Repair" />
        </div>
        <div className="auth-field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" required style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
            <option value="">Select category</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="painting">Painting</option>
            <option value="cleaning">Cleaning</option>
            <option value="carpentry">Carpentry</option>
            <option value="security">Security</option>
            <option value="construction">Construction</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="auth-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={5} required placeholder="Describe your service in detail..." style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", resize: "vertical" }} />
        </div>
        <div className="auth-field">
          <label htmlFor="price">Price (Rs.)</label>
          <input id="price" name="price" type="number" required min="0" placeholder="e.g. 1500" />
        </div>
        <div className="auth-field">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input id="tags" name="tags" type="text" placeholder="plumbing, repair, emergency" />
        </div>
        <div className="auth-field">
          <label htmlFor="location">Location</label>
          <input id="location" name="location" type="text" placeholder="City, area" />
        </div>
        <button className="auth-submit" type="submit">Create Gig</button>
      </form>
    </div>
  );
}
