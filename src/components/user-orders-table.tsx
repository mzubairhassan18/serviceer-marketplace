"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { FilterBar } from "@/components/filter-bar";

interface Order {
  id: string;
  status: string;
  offered_price: number | null;
  created_at: string;
  buyer_id: string;
  provider_id: string;
  gigs?: { title: string } | null;
  buyer?: { name: string } | null;
  provider?: { name: string } | null;
}

const statusFilters = [
  { value: "all", label: "All" },
  { value: "inquiry", label: "Inquiry" },
  { value: "offered", label: "Offered" },
  { value: "in_progress", label: "In Progress" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "disputed", label: "Disputed" },
  { value: "cancelled", label: "Cancelled" },
];

export function UserOrdersTable({ orders, userId }: { orders: Order[]; userId: string }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const isProvider = orders.length > 0 ? orders[0].provider_id === userId : false;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Orders</h1>
        <FilterBar options={statusFilters} active={filter} onChange={setFilter} />
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--muted-foreground)" }}>No orders yet.</p>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--card-border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Gig</th>
                <th>{isProvider ? "Buyer" : "Provider"}</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 500 }}>{o.gigs?.title ?? "Unknown"}</td>
                  <td style={{ fontSize: "0.875rem" }}>
                    {isProvider ? (o.buyer?.name ?? "Unknown") : (o.provider?.name ?? "Unknown")}
                  </td>
                  <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                  <td style={{ fontSize: "0.875rem" }}>
                    {o.offered_price ? formatPrice(o.offered_price) : "-"}
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link href={`/app/orders/${o.id}`} className="btn btn-sm" style={{ textDecoration: "none" }}>View</Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>No orders match this filter</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
