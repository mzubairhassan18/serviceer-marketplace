"use client";

import { useState } from "react";
import { Grid, List, Search } from "lucide-react";

interface AdminTableViewProps {
  data: any[];
  columns: { key: string; label: string; render?: (item: any) => React.ReactNode; hideOnMobile?: boolean }[];
  actions?: (item: any) => React.ReactNode;
  renderGridCard?: (item: any) => React.ReactNode;
  searchable?: boolean;
  searchKeys?: string[];
  emptyMessage?: string;
}

export function AdminTableView({
  data,
  columns,
  actions,
  renderGridCard,
  searchable = true,
  searchKeys = ["title", "name", "email"],
  emptyMessage = "No items found",
}: AdminTableViewProps) {
  const [view, setView] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? data.filter((item) => {
        const q = search.toLowerCase();
        return searchKeys.some((k) => String(item[k] ?? "").toLowerCase().includes(q));
      })
    : data;

  return (
    <div>
      <div className="admin-table-toolbar">
        {searchable && (
          <div className="admin-search">
            <Search size={15} />
            <input
              data-admin-search
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
        <div className="admin-toolbar-spacer" />
        <div className="view-toggle">
          <button type="button" className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
            <List size={14} /> List
          </button>
          <button type="button" className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}>
            <Grid size={14} /> Grid
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="admin-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={col.hideOnMobile ? "hide-mobile" : ""}>{col.label}</th>
                ))}
                {actions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id ?? i}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.hideOnMobile ? "hide-mobile" : ""}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  {actions && <td>{actions(item)}</td>}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="admin-empty-row">{emptyMessage}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-grid">
          {filtered.map((item, i) => (
            <div key={item.id ?? i} className="admin-grid-card card">
              {renderGridCard ? renderGridCard(item) : (
                <>
                  {columns.slice(0, 3).map((col) => (
                    <div key={col.key} className="admin-grid-field">
                      <span className="admin-grid-label">{col.label}</span>
                      <span className="admin-grid-value">{col.render ? col.render(item) : item[col.key]}</span>
                    </div>
                  ))}
                </>
              )}
              {actions && <div className="admin-grid-actions">{actions(item)}</div>}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="admin-empty-row" style={{ gridColumn: "1 / -1" }}>{emptyMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}
