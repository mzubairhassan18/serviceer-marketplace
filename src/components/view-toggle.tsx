"use client";

import { useState } from "react";
import { Grid, List } from "lucide-react";

export function ViewToggle({ onChange }: { onChange: (view: "grid" | "list") => void }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  function handle(v: "grid" | "list") {
    setView(v);
    onChange(v);
  }

  return (
    <div className="view-toggle">
      <button
        type="button"
        className={view === "grid" ? "active" : ""}
        onClick={() => handle("grid")}
      >
        <Grid size={14} /> Grid
      </button>
      <button
        type="button"
        className={view === "list" ? "active" : ""}
        onClick={() => handle("list")}
      >
        <List size={14} /> List
      </button>
    </div>
  );
}
