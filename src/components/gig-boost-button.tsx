"use client";

import { useState, useRef } from "react";
import { requestBoostAction, cancelBoostAction } from "@/app/app/gigs/boost/actions";

interface Subscription {
  id: string;
  status: string;
  end_date: string;
  ad_packages: { name: string; max_gigs: number } | Array<{ name: string; max_gigs: number }> | null;
}

interface BoostInfo {
  id: string;
  status: string;
  subscription_id: string;
}

export function GigBoostButton({
  gigId,
  activeSubscription,
  existingBoost,
}: {
  gigId: string;
  activeSubscription: Subscription | null;
  existingBoost: BoostInfo | null;
}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData(formRef.current!);
      fd.set("gigId", gigId);
      await requestBoostAction(fd);
      setShowModal(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(boostId: string) {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("boostId", boostId);
      await cancelBoostAction(fd);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to cancel");
    } finally {
      setLoading(false);
    }
  }

  if (existingBoost) {
    if (existingBoost.status === "pending") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="status-badge pending">Pending</span>
          <button
            type="button"
            onClick={() => handleCancel(existingBoost.id)}
            disabled={loading}
            className="btn btn-sm"
            style={{ color: "#dc2626", border: "1px solid #dc2626", background: "transparent" }}
          >
            Cancel
          </button>
        </div>
      );
    }
    if (existingBoost.status === "approved") {
      return <span className="status-badge active">Boosted</span>;
    }
  }

  if (!activeSubscription) {
    return (
      <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
        <a href="/app/packages" style={{ color: "var(--primary)", textDecoration: "underline" }}>Subscribe</a> to boost
      </span>
    );
  }

  const pkg = Array.isArray(activeSubscription.ad_packages)
    ? activeSubscription.ad_packages[0]
    : activeSubscription.ad_packages;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="btn btn-sm"
        style={{ background: "#7c3aed", color: "white", border: "none" }}
      >
        Request Boost
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => !loading && setShowModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "400px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Boost Gig</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
              Select your active subscription to boost this gig.
            </p>
            <form ref={formRef} onSubmit={handleRequest}>
              <input type="hidden" name="gigId" value={gigId} />
              <div style={{ marginBottom: "1rem" }}>
                <select
                  name="subscriptionId"
                  defaultValue={activeSubscription.id}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value={activeSubscription.id}>
                    {pkg?.name ?? "Package"} — expires {new Date(activeSubscription.end_date).toLocaleDateString()}
                  </option>
                </select>
              </div>
              {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{error}</p>}
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="btn btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-sm"
                >
                  {loading ? "Requesting..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
