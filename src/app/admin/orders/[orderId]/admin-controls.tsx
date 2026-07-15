"use client";

import { useState } from "react";
import { resolveDisputeAction, closeDisputeAction, adminUpdateOrderStatusAction } from "../actions";

interface Props {
  orderId: string;
  status: string;
}

export function AdminOrderControls({ orderId, status }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolution, setResolution] = useState("");
  const [showResolve, setShowResolve] = useState(false);

  async function handleStatus(newStatus: string) {
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("orderId", orderId);
      fd.set("status", newStatus);
      await adminUpdateOrderStatusAction(fd);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    if (!resolution.trim()) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("orderId", orderId);
      fd.set("resolution", resolution);
      await resolveDisputeAction(fd);
      setShowResolve(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClose() {
    if (!confirm("Close this dispute? This marks it as permanently closed.")) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("orderId", orderId);
      await closeDisputeAction(fd);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isDispute = status === "disputed";
  const isResolved = status === "dispute_resolved";
  const isClosed = status === "dispute_closed";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {error && <div className="auth-error">{error}</div>}

      {isDispute && (
        <>
          {showResolve ? (
            <form onSubmit={handleResolve} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe the resolution..."
                rows={3}
                required
                style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", resize: "vertical", fontSize: "0.875rem" }}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" disabled={loading || !resolution.trim()} style={{ fontSize: "0.875rem" }}>
                  {loading ? "Resolving..." : "Confirm Resolve"}
                </button>
                <button type="button" className="btn" onClick={() => setShowResolve(false)} disabled={loading} style={{ fontSize: "0.875rem" }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowResolve(true)} disabled={loading}>
              Resolve Dispute
            </button>
          )}
          <button className="btn" onClick={handleClose} disabled={loading} style={{ border: "1px solid #dc2626", color: "#dc2626" }}>
            Close Dispute
          </button>
        </>
      )}

      {isResolved && (
        <p style={{ color: "#15803d", fontSize: "0.875rem", fontWeight: 500 }}>Dispute has been resolved.</p>
      )}

      {isClosed && (
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Dispute has been closed.</p>
      )}

      {!isDispute && !isResolved && !isClosed && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "0.25rem" }}>
            Force update order status:
          </p>
          {["accepted", "in_progress", "delivered", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              className="btn"
              onClick={() => handleStatus(s)}
              disabled={loading || status === s}
              style={{ fontSize: "0.8rem", textAlign: "left" }}
            >
              Set to {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
