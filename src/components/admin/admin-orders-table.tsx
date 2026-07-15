"use client";

import { useState } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/filter-bar";

interface Order {
  id: string;
  status: string;
  created_at: string;
  gigs?: { title: string } | null;
  profiles?: { name: string } | null;
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

export function AdminOrdersTable({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState("all");

  const disputed = orders.filter((o) => o.status === "disputed");
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>All Orders</h1>
        <FilterBar options={statusFilters} active={filter} onChange={setFilter} />
      </div>

      {disputed.length > 0 && filter === "all" && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--danger)", marginBottom: "0.75rem" }}>
            Disputed Orders ({disputed.length})
          </h2>
          <div style={{ border: "1px solid var(--danger)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Gig</th>
                  <th>Buyer</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {disputed.map((o) => (
                  <tr key={o.id} style={{ background: "var(--danger-bg)" }}>
                    <td style={{ fontWeight: 500 }}>{o.gigs?.title ?? "Unknown"}</td>
                    <td>{o.buyer?.name ?? "Unknown"}</td>
                    <td><span className="status-badge disputed">disputed</span></td>
                    <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ textDecoration: "none" }}
                      >
                        Review & Resolve
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ border: "1px solid var(--card-border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Gig</th>
              <th>Buyer</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.filter((o) => filter === "all" ? o.status !== "disputed" : true).map((o) => (
              <tr key={o.id}>
                <td>{o.gigs?.title ?? "Unknown"}</td>
                <td>{o.buyer?.name ?? "Unknown"}</td>
                <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
                <td>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none" }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
