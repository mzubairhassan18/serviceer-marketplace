"use client";

import { useState } from "react";
import { raiseDisputeAction } from "../actions";

interface DisputeFormProps {
  orderId: string;
  onSuccess?: () => void;
}

export function DisputeForm({ orderId, onSuccess }: DisputeFormProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please describe the issue");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("orderId", orderId);
      formData.set("reason", reason);
      await raiseDisputeAction(formData);
      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to raise dispute");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="auth-message" style={{ textAlign: "center", padding: "1.5rem" }}>
        Your dispute has been submitted. Our team will review it shortly.
      </div>
    );
  }

  return (
    <div className="card" style={{ border: "1px solid #dc2626" }}>
      <h3 style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#dc2626" }}>Raise a Dispute</h3>
      <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
        Describe the issue with this order. Our team will review it.
      </p>
      {error && <div className="auth-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="dispute-reason">What went wrong?</label>
          <textarea
            id="dispute-reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the issue in detail..."
            required
            style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", resize: "vertical" }}
          />
        </div>
        <button
          className="btn"
          type="submit"
          disabled={submitting || !reason.trim()}
          style={{ background: "#dc2626", color: "white", border: "none" }}
        >
          {submitting ? "Submitting..." : "Submit Dispute"}
        </button>
      </form>
    </div>
  );
}
