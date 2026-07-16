"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { updatePackageAction } from "@/app/admin/packages/actions";

interface Package {
  id: string;
  name: string;
  description: string;
  price_minor: number;
  duration_days: number;
  is_active: boolean;
  max_gigs: number;
}

export function PackagesClient({ packages }: { packages: Package[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Ad Packages</h1>
      </div>

      <div className="admin-grid packages-grid">
        {packages.map((pkg) => (
          <div key={pkg.id} id={pkg.id} className={`card package-card${editingId === pkg.id ? " editing" : ""}`}>
            <div className="package-card-header">
              <span className={`status-badge ${pkg.is_active ? "active" : "expired"}`}>
                {pkg.is_active ? "Active" : "Inactive"}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setEditingId(editingId === pkg.id ? null : pkg.id)}
              >
                {editingId === pkg.id ? "Cancel" : "Edit"}
              </button>
            </div>

            {editingId === pkg.id ? (
              <form action={updatePackageAction} className="package-edit-form">
                <input type="hidden" name="packageId" value={pkg.id} />

                <div className="auth-field">
                  <label>Name</label>
                  <input name="name" defaultValue={pkg.name} required />
                </div>

                <div className="auth-field">
                  <label>Description</label>
                  <textarea name="description" defaultValue={pkg.description} rows={2} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="auth-field">
                    <label>Price (PKR)</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={(pkg.price_minor / 100).toFixed(2)}
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label>Duration (days)</label>
                    <input
                      name="durationDays"
                      type="number"
                      min="1"
                      defaultValue={pkg.duration_days}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Active</label>
                  <select name="isActive" defaultValue={pkg.is_active ? "true" : "false"}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="package-card-body">
                <h3 className="package-name">{pkg.name}</h3>
                <p className="package-desc">{pkg.description}</p>
                <div className="package-price">{formatPrice(pkg.price_minor)}</div>
                <div className="package-meta">
                  {pkg.duration_days} days · {pkg.max_gigs} gig{pkg.max_gigs > 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
