"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, MessageSquare, ShoppingBag, CreditCard, Settings, LogOut, User } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

export function AppShell({ children, user }: { children: React.ReactNode; user: { email: string; name: string } }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/gigs", label: "My Gigs", icon: Briefcase },
    { href: "/app/orders", label: "Orders", icon: ShoppingBag },
    { href: "/app/messages", label: "Messages", icon: MessageSquare },
    { href: "/app/packages", label: "Packages", icon: CreditCard },
    { href: "/app/profile", label: "Profile", icon: User },
    { href: "/app/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="app-layout">
      <nav className="app-sidebar">
        <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem", padding: "0 0.75rem" }}>
          Serviceer
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
        <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border)", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
          <div style={{ fontWeight: 500 }}>{user.name}</div>
          <div>{user.email}</div>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="nav-link" style={{ width: "100%", background: "none", border: "none", cursor: "pointer" }}>
            <LogOut size={16} /> Sign out
          </button>
        </form>
      </nav>
      <main className="app-main">{children}</main>
    </div>
  );
}
