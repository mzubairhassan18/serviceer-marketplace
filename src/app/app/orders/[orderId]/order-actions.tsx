"use client";

import { useState } from "react";
import { updateOrderStatusAction, sendOfferAction } from "../actions";

interface OrderActionsProps {
  orderId: string;
  status: string;
  isBuyer: boolean;
  isProvider: boolean;
  offeredPrice: number | null;
}

export function OrderActions({ orderId, status, isBuyer, isProvider, offeredPrice }: OrderActionsProps) {
  const [counterPrice, setCounterPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction(newStatus: string) {
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("orderId", orderId);
      fd.set("status", newStatus);
      await updateOrderStatusAction(fd);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!counterPrice || Number(counterPrice) <= 0) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("orderId", orderId);
      fd.set("offered_price", counterPrice);
      await sendOfferAction(fd);
      setCounterPrice("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {error && <div className="auth-error">{error}</div>}

      {isProvider && status === "inquiry" && (
        <>
          <button className="btn btn-primary" disabled={loading} onClick={() => handleAction("accepted")}>
            Accept
          </button>
          <form onSubmit={handleOffer} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="number"
              min="1"
              value={counterPrice}
              onChange={(e) => setCounterPrice(e.target.value)}
              placeholder="Counter price (Rs)"
              style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
            />
            <button className="btn" type="submit" disabled={loading || !counterPrice}>
              Send Offer
            </button>
          </form>
        </>
      )}

      {isProvider && status === "offered" && (
        <button className="btn" disabled={loading} onClick={() => handleAction("cancelled")}>
          Cancel Offer
        </button>
      )}

      {isProvider && status === "accepted" && (
        <>
          <button className="btn btn-primary" disabled={loading} onClick={() => handleAction("in_progress")}>
            Start Work
          </button>
          <button className="btn" disabled={loading} onClick={() => handleAction("cancelled")}>
            Cancel
          </button>
        </>
      )}

      {isProvider && status === "in_progress" && (
        <>
          <button className="btn btn-primary" disabled={loading} onClick={() => handleAction("delivered")}>
            Mark Delivered
          </button>
          <button className="btn" disabled={loading} onClick={() => handleAction("cancelled")}>
            Cancel
          </button>
        </>
      )}

      {isBuyer && status === "offered" && (
        <>
          <button className="btn btn-primary" disabled={loading} onClick={() => handleAction("accepted")}>
            Accept Offer
          </button>
          <button className="btn" disabled={loading} onClick={() => handleAction("cancelled")}>
            Decline
          </button>
        </>
      )}

      {isBuyer && status === "delivered" && (
        <button className="btn btn-primary" disabled={loading} onClick={() => handleAction("payment_received")}>
          Confirm Payment Received
        </button>
      )}

      {isBuyer && status === "payment_received" && (
        <button className="btn btn-primary" disabled={loading} onClick={() => handleAction("completed")}>
          Confirm Completion
        </button>
      )}

      {!isProvider && !isBuyer && (
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>No actions available for your role.</p>
      )}
    </div>
  );
}
