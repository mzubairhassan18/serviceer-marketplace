"use client";

import { useState } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/filter-bar";
import { AdminTableView } from "@/components/admin/admin-table-view";
import { formatPrice } from "@/lib/format";

interface Order {
  id: string;
  status: string;
  created_at: string;
  gigs?: { title: string } | null;
  buyer?: { name: string } | null;
  provider?: { name: string } | null;
}

interface Package {
  id: string;
  name: string;
  description: string;
  price_minor: number;
  duration_days: number;
  is_active: boolean;
  max_gigs: number;
}

export function AdminOrdersClient({ orders, packages }: { orders: Order[]; packages: Package[] }) {
  const [tab, setTab] = useState<"orders" | "packages">("orders");
  const [statusFilter, setStatusFilter] = useState("all");

  const orderFilters = [
    { value: "all", label: "All" },
    { value: "inquiry", label: "Inquiry" },
    { value: "in_progress", label: "In Progress" },
    { value: "delivered", label: "Delivered" },
    { value: "completed", label: "Completed" },
    { value: "disputed", label: "Disputed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const disputed = orders.filter((o) => o.status === "disputed");
  const filteredOrders = statusFilter === "all"
    ? orders.filter((o) => o.status !== "disputed")
    : orders.filter((o) => o.status === statusFilter);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders & Packages</h1>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === "orders" ? " active" : ""}`}
          onClick={() => { setTab("orders"); setStatusFilter("all"); }}
        >
          Orders <span className="admin-tab-count">{orders.length}</span>
        </button>
        <button
          className={`admin-tab${tab === "packages" ? " active" : ""}`}
          onClick={() => { setTab("packages"); setStatusFilter("all"); }}
        >
          Packages <span className="admin-tab-count">{packages.length}</span>
        </button>
      </div>

      {tab === "orders" && (
        <>
          {/* Disputed alert */}
          {disputed.length > 0 && statusFilter === "all" && (
            <div className="admin-alert admin-alert-danger">
              <strong>{disputed.length} disputed order{disputed.length > 1 ? "s" : ""}</strong> need your attention
              <Link href={`/admin/orders/${disputed[0].id}`} className="btn btn-sm btn-reject" style={{ marginLeft: "auto", textDecoration: "none" }}>
                Review
              </Link>
            </div>
          )}

          <div className="admin-tab-bar">
            <FilterBar options={orderFilters} active={statusFilter} onChange={setStatusFilter} />
          </div>

          <AdminTableView
            data={filteredOrders}
            searchKeys={["title", "name"]}
            emptyMessage="No orders found"
            columns={[
              { key: "gig", label: "Gig", render: (o) => <strong>{o.gigs?.title ?? "—"}</strong> },
              { key: "buyer", label: "Buyer", render: (o) => o.buyer?.name ?? "—" },
              { key: "provider", label: "Provider", hideOnMobile: true, render: (o) => o.provider?.name ?? "—" },
              { key: "status", label: "Status", render: (o) => <span className={`status-badge ${o.status}`}>{o.status}</span> },
              { key: "created_at", label: "Date", hideOnMobile: true, render: (o) => new Date(o.created_at).toLocaleDateString() },
            ]}
            actions={(o) => (
              <Link href={`/admin/orders/${o.id}`} className="btn btn-sm btn-ghost" style={{ textDecoration: "none" }}>
                View
              </Link>
            )}
          />
        </>
      )}

      {tab === "packages" && (
        <AdminTableView
          data={packages}
          searchKeys={["name", "description"]}
          emptyMessage="No packages"
          columns={[
            { key: "name", label: "Package", render: (p) => <strong>{p.name}</strong> },
            { key: "price", label: "Price", render: (p) => <strong style={{ color: "var(--success)" }}>{formatPrice(p.price_minor)}</strong> },
            { key: "duration", label: "Duration", hideOnMobile: true, render: (p) => `${p.duration_days} days` },
            { key: "max_gigs", label: "Max Gigs", hideOnMobile: true, render: (p) => p.max_gigs },
            { key: "status", label: "Status", render: (p) => <span className={`status-badge ${p.is_active ? "active" : "expired"}`}>{p.is_active ? "Active" : "Inactive"}</span> },
          ]}
          actions={(p) => (
            <Link href={`/admin/packages#${p.id}`} className="btn btn-sm btn-ghost" style={{ textDecoration: "none" }}>
              Edit
            </Link>
          )}
          renderGridCard={(p) => (
            <div className="admin-card-content">
              <div className="admin-card-header">
                <strong>{p.name}</strong>
                <span className={`status-badge ${p.is_active ? "active" : "expired"}`}>{p.is_active ? "Active" : "Inactive"}</span>
              </div>
              <div className="admin-card-price">{formatPrice(p.price_minor)}</div>
              <div className="admin-card-meta">{p.duration_days} days · {p.max_gigs} gig{p.max_gigs > 1 ? "s" : ""}</div>
            </div>
          )}
        />
      )}
    </div>
  );
}
