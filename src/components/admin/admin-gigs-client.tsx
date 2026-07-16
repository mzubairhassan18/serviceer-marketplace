"use client";

import { useState } from "react";
import { FilterBar } from "@/components/filter-bar";
import { AdminTableView } from "@/components/admin/admin-table-view";
import { approveGigAction, rejectGigAction } from "@/app/admin/gigs/actions";
import { approveBoostAction, rejectBoostAction } from "@/app/admin/boosts/actions";
import { formatPrice } from "@/lib/format";

interface Gig {
  id: string;
  title: string;
  category: string;
  price: number;
  status: string;
  created_at: string;
  profiles: { name: string }[] | null;
  featured_until: string | null;
}

interface Boost {
  id: string;
  status: string;
  created_at: string;
  profiles: { name: string }[] | null;
  gigs: { title: string }[] | null;
  provider_subscriptions: {
    end_date: string;
    ad_packages: { name: string }[] | null;
  }[] | null;
}

export function AdminGigsClient({ gigs, boosts }: { gigs: Gig[]; boosts: Boost[] }) {
  const [tab, setTab] = useState<"gigs" | "boosts">("gigs");
  const [statusFilter, setStatusFilter] = useState("all");

  const gigFilters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const boostFilters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const filteredGigs = statusFilter === "all" ? gigs : gigs.filter((g) => g.status === statusFilter);
  const filteredBoosts = statusFilter === "all" ? boosts : boosts.filter((b) => b.status === statusFilter);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Gigs & Boosts</h1>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === "gigs" ? " active" : ""}`}
          onClick={() => { setTab("gigs"); setStatusFilter("all"); }}
        >
          Gigs <span className="admin-tab-count">{gigs.length}</span>
        </button>
        <button
          className={`admin-tab${tab === "boosts" ? " active" : ""}`}
          onClick={() => { setTab("boosts"); setStatusFilter("all"); }}
        >
          Boost Requests <span className="admin-tab-count">{boosts.length}</span>
        </button>
      </div>

      <div className="admin-tab-bar">
        <FilterBar
          options={tab === "gigs" ? gigFilters : boostFilters}
          active={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {tab === "gigs" ? (
        <AdminTableView
          data={filteredGigs}
          searchKeys={["title", "category"]}
          emptyMessage="No gigs found"
          columns={[
            { key: "title", label: "Title", render: (g) => <strong>{g.title}</strong> },
            { key: "provider", label: "Provider", render: (g) => (Array.isArray(g.profiles) ? g.profiles[0]?.name : g.profiles?.name) ?? "—" },
            { key: "category", label: "Category", hideOnMobile: true },
            { key: "price", label: "Price", render: (g) => formatPrice(g.price) },
            { key: "status", label: "Status", render: (g) => <span className={`status-badge ${g.status}`}>{g.status}</span> },
            { key: "created_at", label: "Created", hideOnMobile: true, render: (g) => new Date(g.created_at).toLocaleDateString() },
          ]}
          actions={(g) => (
            <div className="admin-action-btns">
              {g.status === "pending" && (
                <>
                  <form action={approveGigAction}>
                    <input type="hidden" name="gigId" value={g.id} />
                    <button type="submit" className="btn btn-sm btn-approve">Approve</button>
                  </form>
                  <form action={rejectGigAction}>
                    <input type="hidden" name="gigId" value={g.id} />
                    <button type="submit" className="btn btn-sm btn-reject">Reject</button>
                  </form>
                </>
              )}
            </div>
          )}
          renderGridCard={(g) => (
            <div className="admin-card-content">
              <div className="admin-card-header">
                <strong>{g.title}</strong>
                <span className={`status-badge ${g.status}`}>{g.status}</span>
              </div>
              <div className="admin-card-meta">{(Array.isArray(g.profiles) ? g.profiles[0]?.name : g.profiles?.name) ?? "Unknown"} · {g.category}</div>
              <div className="admin-card-price">{formatPrice(g.price)}</div>
            </div>
          )}
        />
      ) : (
        <AdminTableView
          data={filteredBoosts}
          searchKeys={["title", "name"]}
          emptyMessage="No boost requests"
          columns={[
            { key: "provider", label: "Provider", render: (b) => (Array.isArray(b.profiles) ? b.profiles[0]?.name : b.profiles?.name) ?? "—" },
            { key: "gig", label: "Gig", render: (b) => <strong>{(Array.isArray(b.gigs) ? b.gigs[0]?.title : b.gigs?.title) ?? "—"}</strong> },
            { key: "package", label: "Package", hideOnMobile: true, render: (b) => (Array.isArray(b.provider_subscriptions) ? b.provider_subscriptions[0]?.ad_packages?.[0]?.name : (b as any).provider_subscriptions?.ad_packages?.name) ?? "—" },
            { key: "status", label: "Status", render: (b) => <span className={`status-badge ${b.status}`}>{b.status}</span> },
            { key: "created_at", label: "Requested", hideOnMobile: true, render: (b) => new Date(b.created_at).toLocaleDateString() },
          ]}
          actions={(b) => (
            <div className="admin-action-btns">
              {b.status === "pending" && (
                <>
                  <form action={approveBoostAction}>
                    <input type="hidden" name="boostId" value={b.id} />
                    <button type="submit" className="btn btn-sm btn-approve">Approve</button>
                  </form>
                  <form action={rejectBoostAction}>
                    <input type="hidden" name="boostId" value={b.id} />
                    <button type="submit" className="btn btn-sm btn-reject">Reject</button>
                  </form>
                </>
              )}
            </div>
          )}
          renderGridCard={(b) => (
            <div className="admin-card-content">
              <div className="admin-card-header">
                <strong>{(Array.isArray(b.gigs) ? b.gigs[0]?.title : b.gigs?.title) ?? "Unknown"}</strong>
                <span className={`status-badge ${b.status}`}>{b.status}</span>
              </div>
              <div className="admin-card-meta">{(Array.isArray(b.profiles) ? b.profiles[0]?.name : b.profiles?.name) ?? "Unknown"}</div>
            </div>
          )}
        />
      )}
    </div>
  );
}
