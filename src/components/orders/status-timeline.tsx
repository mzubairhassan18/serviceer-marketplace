"use client";

import { ChevronRight } from "lucide-react";

interface HistoryEntry {
  id: string;
  from_status: string | null;
  to_status: string;
  actor_name: string;
  note: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  inquiry: "#6366f1",
  offered: "#8b5cf6",
  accepted: "#3b82f6",
  in_progress: "#f59e0b",
  delivered: "#10b981",
  payment_received: "#059669",
  completed: "#15803d",
  cancelled: "#9ca3af",
  disputed: "#dc2626",
  dispute_resolved: "#16a34a",
  dispute_closed: "#6b7280",
};

const statusLabels: Record<string, string> = {
  inquiry: "Inquiry",
  offered: "Offer Sent",
  accepted: "Accepted",
  in_progress: "In Progress",
  delivered: "Delivered",
  payment_received: "Payment Received",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
  dispute_resolved: "Resolved",
  dispute_closed: "Closed",
};

export function StatusTimeline({ entries }: { entries: HistoryEntry[] }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="card" style={{ padding: "1rem" }}>
        <h3 style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--muted-foreground)" }}>
          Status History
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>No status changes recorded.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "1rem" }}>
      <h3 style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "1rem", color: "var(--muted-foreground)" }}>
        Status History
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {entries.map((entry, i) => {
          const isLast = i === entries.length - 1;
          const color = statusColors[entry.to_status] || "#6b7280";
          const label = statusLabels[entry.to_status] || entry.to_status;

          return (
            <div key={entry.id} style={{ display: "flex", gap: "0.75rem" }}>
              {/* Timeline line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "20px", flexShrink: 0 }}>
                <div style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: color,
                  border: "2px solid white",
                  boxShadow: `0 0 0 1px ${color}`,
                  marginTop: "4px",
                  flexShrink: 0,
                }} />
                {!isLast && (
                  <div style={{
                    width: "2px",
                    flex: 1,
                    background: "var(--border)",
                    marginTop: "2px",
                    marginBottom: "-2px",
                  }} />
                )}
              </div>
              {/* Content */}
              <div style={{ paddingBottom: isLast ? "0" : "1rem", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                  {entry.from_status && (
                    <>
                      <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                        {statusLabels[entry.from_status] || entry.from_status}
                      </span>
                      <ChevronRight size={12} style={{ color: "var(--muted-foreground)" }} />
                    </>
                  )}
                  <span style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color,
                    padding: "0.1rem 0.4rem",
                    background: `${color}15`,
                    borderRadius: "4px",
                  }}>
                    {label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.15rem" }}>
                  {entry.actor_name && (
                    <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
                      by {entry.actor_name}
                    </span>
                  )}
                  <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>
                    {new Date(entry.created_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {entry.note && (
                  <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.25rem", lineHeight: 1.4 }}>
                    {entry.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
