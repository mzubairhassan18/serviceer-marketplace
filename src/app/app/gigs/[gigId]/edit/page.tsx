import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { updateGigAction } from "./actions";

export default async function EditGigPage(props: { params: Promise<{ gigId: string }> }) {
  const { gigId } = await props.params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: gig } = await supabase.from("gigs").select("*").eq("id", gigId).eq("providerId", user.id).single();
  if (!gig) notFound();

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Edit Gig</h1>
      <form action={updateGigAction} className="auth-form">
        <input type="hidden" name="gigId" value={gig.id} />
        <div className="auth-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" defaultValue={gig.title} required />
        </div>
        <div className="auth-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={5} required defaultValue={gig.description} style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", resize: "vertical" }} />
        </div>
        <div className="auth-field">
          <label htmlFor="price">Price (Rs.)</label>
          <input id="price" name="price" type="number" defaultValue={gig.price / 100} required min="0" />
        </div>
        <div className="auth-field">
          <label htmlFor="tags">Tags</label>
          <input id="tags" name="tags" type="text" defaultValue={gig.tags?.join(", ")} />
        </div>
        <button className="auth-submit" type="submit">Update Gig</button>
      </form>
    </div>
  );
}
