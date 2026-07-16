"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { logAuditEvent } from "@/lib/audit";

export async function approveGigAction(formData: FormData) {
  const gigId = formData.get("gigId") as string;
  const supabase = createClient(await cookies());

  const { data: gig } = await supabase
    .from("gigs")
    .select("provider_id, title")
    .eq("id", gigId)
    .single();

  await supabase.from("gigs").update({ status: "approved" }).eq("id", gigId);

  if (gig) {
    await supabase.from("notifications").insert({
      user_id: gig.provider_id,
      title: "Your gig has been approved",
      body: gig.title,
      type: "gig_approved",
      entity_type: "gig",
      entity_id: gigId,
      href: `/app/gigs`,
    });

    await logAuditEvent("gig_approved", "gig", gigId, `Approved gig: ${gig.title}`);

    // Auto-generate embedding for semantic search (non-blocking)
    storeGigEmbeddingSafe(gigId);
  }

  revalidatePath("/admin/gigs");
}

async function storeGigEmbeddingSafe(gigId: string) {
  try {
    const { storeGigEmbedding } = await import("@/lib/embeddings");
    await storeGigEmbedding(gigId);
  } catch {
    // Embeddings may not be set up yet — silently ignore
  }
}

export async function rejectGigAction(formData: FormData) {
  const gigId = formData.get("gigId") as string;
  const supabase = createClient(await cookies());

  const { data: gig } = await supabase
    .from("gigs")
    .select("provider_id, title")
    .eq("id", gigId)
    .single();

  await supabase.from("gigs").update({ status: "rejected" }).eq("id", gigId);

  if (gig) {
    await supabase.from("notifications").insert({
      user_id: gig.provider_id,
      title: "Your gig has been rejected",
      body: gig.title,
      type: "gig_rejected",
      entity_type: "gig",
      entity_id: gigId,
      href: `/app/gigs`,
    });

    await logAuditEvent("gig_rejected", "gig", gigId, `Rejected gig: ${gig.title}`);
  }

  revalidatePath("/admin/gigs");
}
