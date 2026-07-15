"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";

const categories = [
  "Plumbing",
  "Electrical",
  "Painting",
  "Cleaning",
  "Carpentry",
  "Security",
  "Construction",
];

export function HeroSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [open, setOpen] = useState(false);

  function applyFilters(q: string, cat: string) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat) params.set("category", cat.toLowerCase());
    const qs = params.toString();
    router.push(`/${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function handleSearch() {
    applyFilters(query, category);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  function selectCategory(cat: string) {
    setCategory(cat);
    setOpen(false);
    applyFilters(query, cat);
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "var(--radius)",
              color: "white",
              fontSize: "0.9rem",
              cursor: "pointer",
              minWidth: "160px",
              justifyContent: "space-between",
            }}
          >
            {category || "All Categories"}
            <ChevronDown size={16} />
          </button>
          {open && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "0.25rem",
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: "var(--radius)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 50,
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => selectCategory("")}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "0.6rem 1rem",
                  textAlign: "left",
                  border: "none",
                  background: !category ? "var(--muted)" : "var(--card)",
                  color: "var(--foreground)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => selectCategory(cat)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.6rem 1rem",
                    textAlign: "left",
                    border: "none",
                    background: category === cat ? "var(--muted)" : "var(--card)",
                    color: "var(--foreground)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="text"
          placeholder="Search for a service..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "var(--radius)",
            background: "rgba(255,255,255,0.15)",
            color: "white",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="btn btn-primary"
          style={{ padding: "0.75rem 1.5rem" }}
        >
          <Search size={18} /> Search
        </button>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        {categories.slice(0, 5).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => selectCategory(cat)}
            style={{
              background: category === cat.toLowerCase() ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.8rem",
              cursor: "pointer",
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
