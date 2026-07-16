"use client";

import { AdminTableView } from "@/components/admin/admin-table-view";

interface AuditEvent {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  summary: string;
  occurred_at: string;
  metadata: any;
}

export function AuditClient({ events }: { events: AuditEvent[] }) {
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Audit Log</h1>
      </div>

      <AdminTableView
        data={events}
        searchKeys={["action", "entity_type", "summary"]}
        emptyMessage="No audit events yet"
        columns={[
          { key: "action", label: "Action", render: (e) => <span className="status-badge">{e.action}</span> },
          { key: "entity_type", label: "Entity", render: (e) => <code style={{ fontSize: "0.8rem" }}>{e.entity_type}</code> },
          { key: "summary", label: "Summary" },
          { key: "occurred_at", label: "Date", hideOnMobile: true, render: (e) => new Date(e.occurred_at).toLocaleString() },
        ]}
        renderGridCard={(e) => (
          <div className="admin-card-content">
            <div className="admin-card-header">
              <span className="status-badge">{e.action}</span>
              <code style={{ fontSize: "0.75rem" }}>{e.entity_type}</code>
            </div>
            <div className="admin-card-meta">{e.summary}</div>
          </div>
        )}
      />
    </div>
  );
}
