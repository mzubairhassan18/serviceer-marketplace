"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Briefcase, Users, ShoppingBag, BarChart3, LogOut, Keyboard } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, key: "d" },
  { href: "/admin/gigs", label: "Gigs & Boosts", icon: Briefcase, key: "g" },
  { href: "/admin/orders", label: "Orders & Packages", icon: ShoppingBag, key: "o" },
  { href: "/admin/users", label: "Users", icon: Users, key: "u" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, key: "a" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>("[data-admin-search]");
        searchInput?.focus();
      }

      for (const item of navItems) {
        if (e.key === item.key) {
          e.preventDefault();
          router.push(item.href);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <Link href="/admin/dashboard" className="admin-sidebar-logo">
          <span className="admin-logo-icon">⚡</span>
          <span>Admin</span>
        </Link>

        <div className="admin-nav-group">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`admin-nav-link${isActive ? " active" : ""}`}>
                <Icon size={16} />
                <span>{item.label}</span>
                <kbd className="admin-nav-key">{item.key}</kbd>
              </Link>
            );
          })}
        </div>

        <div className="admin-sidebar-footer">
          <Link href="/admin/audit" className={`admin-nav-link${pathname === "/admin/audit" ? " active" : ""}`}>
            <Keyboard size={16} />
            <span>Audit Log</span>
          </Link>
          <Link href="/app" className="admin-nav-link">&larr; Back to app</Link>
          <form action={signOutAction}>
            <button type="submit" className="admin-nav-link" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", font: "inherit" }}>
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      </nav>
      <main className="admin-main">{children}</main>
    </div>
  );
}
