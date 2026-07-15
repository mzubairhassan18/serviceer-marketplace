import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function AdminAuditPage() {
  const supabase = createClient(await cookies());
  const { data: events } = await supabase
    .from("audit_events")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Audit Log</h1>

      <table className="data-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Entity</th>
            <th>Summary</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {events?.map((e: any) => (
            <tr key={e.id}>
              <td><span className="status-badge">{e.action}</span></td>
              <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{e.entity_type}</td>
              <td style={{ fontSize: "0.875rem", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis" }}>
                {e.summary}
              </td>
              <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {new Date(e.occurred_at).toLocaleString()}
              </td>
            </tr>
          ))}
          {(!events || events.length === 0) && (
            <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>No audit events yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
