"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, Users, ShoppingBag, Package, Zap, ClipboardList, LogOut } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/gigs", label: "Gigs", icon: Briefcase },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/packages", label: "Packages", icon: Package },
    { href: "/admin/boosts", label: "Boosts", icon: Zap },
    { href: "/admin/audit", label: "Audit", icon: ClipboardList },
  ];

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem", padding: "0 0.75rem" }}>
          Admin Panel
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`nav-link${isActive ? " active" : ""}`}>
              <Icon size={16} /> {item.label}
            </Link>
          );
        })}
        <div style={{ flex: 1 }} />
        <Link href="/app" className="nav-link" style={{ fontSize: "0.8rem" }}>&larr; Back to app</Link>
        <form action={signOutAction}>
          <button type="submit" className="nav-link" style={{ width: "100%", background: "none", border: "none", cursor: "pointer" }}>
            <LogOut size={16} /> Sign out
          </button>
        </form>
      </nav>
      <main className="admin-main">{children}</main>
    </div>
  );
}
