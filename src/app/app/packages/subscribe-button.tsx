"use client";

import { useState, useRef } from "react";
import { subscribeAction } from "./actions";

export function SubscribeButton({ packageId, packageName }: { packageId: string; packageName: string }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData(formRef.current!);
      fd.set("packageId", packageId);
      await subscribeAction(fd);
      setDone(true);
      setShow(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <span className="status-badge active" style={{ display: "inline-block" }}>Subscribed</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShow(true)}
        className="btn btn-primary"
        style={{ width: "100%", textDecoration: "none" }}
      >
        Subscribe
      </button>

      {show && (
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
          onClick={() => !loading && setShow(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "400px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Subscribe to {packageName}</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
              Enter payment reference or transaction ID.
            </p>
            <form ref={formRef} onSubmit={handleSubmit}>
              <input type="hidden" name="packageId" value={packageId} />
              <input
                name="paymentDetails"
                type="text"
                placeholder="Transaction ID or payment reference"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: "0.9rem",
                  marginBottom: "1rem",
                  boxSizing: "border-box",
                }}
              />
              {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{error}</p>}
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShow(false)}
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
                  {loading ? "Subscribing..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
