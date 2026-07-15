import { createClient } from "@/utils/supabase/server";

export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string | null,
  summary: string,
  metadata?: Record<string, unknown>
) {
  const supabase = createClient(await (await import("next/headers")).cookies());
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("audit_events").insert({
    actor_id: user?.id ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    metadata: metadata ?? null,
  });
}
