"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";

export function HeaderSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Hide on home page (hero has its own search)
  if (pathname === "/") return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="header-search">
      <Search size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search services..."
      />
    </form>
  );
}
