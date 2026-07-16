"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, ChevronRight, CreditCard, LayoutDashboard, LogOut, Menu, MessageSquare, Search, Settings, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { signOutAction } from "@/app/auth/actions";

const navItems = [
  { href: "/app/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/app/gigs", label: "My services", icon: BriefcaseBusiness },
  { href: "/app/orders", label: "Orders", icon: ShoppingBag },
  { href: "/app/messages", label: "Messages", icon: MessageSquare },
  { href: "/app/packages", label: "Growth plans", icon: CreditCard },
  { href: "/app/profile", label: "Public profile", icon: User },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, user }: { children: React.ReactNode; user: { email: string; name: string } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = navItems.find((item) => pathname.startsWith(item.href))?.label ?? "Workspace";
  const initials = user.name.split(" ").map((part) => part[0]).slice(0, 2).join("");

  return (
    <div className="workspace-layout">
      <aside className={`workspace-sidebar${open ? " open" : ""}`}>
        <div className="workspace-brand"><Link href="/"><span>S</span>Serviceer</Link><button onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
        <div className="workspace-label">Provider workspace</div>
        <nav className="workspace-nav" aria-label="Provider navigation">
          {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={pathname.startsWith(href) ? "active" : ""}><Icon size={18} /><span>{label}</span>{pathname.startsWith(href) && <ChevronRight size={15} />}</Link>)}
        </nav>
        <div className="workspace-promo"><span>Grow your reach</span><strong>Get seen by more local customers.</strong><Link href="/app/packages">Explore plans →</Link></div>
        <div className="workspace-user"><span className="workspace-avatar">{initials}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div>
        <form action={signOutAction}><button type="submit" className="workspace-signout"><LogOut size={17} /> Sign out</button></form>
      </aside>
      {open && <button className="workspace-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <div className="workspace-content">
        <header className="workspace-topbar"><button className="workspace-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div><small>Workspace</small><strong>{current}</strong></div><Link href="/#services" className="workspace-market-link"><Search size={16} /> Visit marketplace</Link></header>
        <main className="workspace-main">{children}</main>
      </div>
    </div>
  );
}
