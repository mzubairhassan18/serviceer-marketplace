import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { AuditClient } from "@/components/admin/admin-audit-client";

export default async function AdminAuditPage() {
  const supabase = createClient(await cookies());
  const { data: events } = await supabase
    .from("audit_events")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(200);

  return <AuditClient events={events ?? []} />;
}
