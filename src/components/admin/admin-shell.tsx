"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Activity, BarChart3, BriefcaseBusiness, ChevronRight, ClipboardList, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, ShoppingBag, Users, X } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

const navItems = [
  { href: "/admin/dashboard", label: "Command center", icon: LayoutDashboard, key: "d" },
  { href: "/admin/gigs", label: "Services & boosts", icon: BriefcaseBusiness, key: "g" },
  { href: "/admin/orders", label: "Orders & plans", icon: ShoppingBag, key: "o" },
  { href: "/admin/users", label: "Community", icon: Users, key: "u" },
  { href: "/admin/analytics", label: "Performance", icon: BarChart3, key: "a" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false);
  const current = [...navItems, { href: "/admin/audit", label: "Audit trail" }].find((item) => pathname.startsWith(item.href))?.label ?? "Administration";
  useEffect(() => { const handler = (event: KeyboardEvent) => { if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || event.metaKey || event.ctrlKey || event.altKey) return; if (event.key === "/") { event.preventDefault(); document.querySelector<HTMLInputElement>("[data-admin-search]")?.focus(); } navItems.forEach((item) => { if (event.key === item.key) router.push(item.href); }); }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [router]);
  return <div className="workspace-layout admin-workspace">
    <aside className={`workspace-sidebar admin-workspace-sidebar${open ? " open" : ""}`}>
      <div className="workspace-brand"><Link href="/admin/dashboard"><span><ShieldCheck size={18} /></span>Serviceer</Link><button onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <div className="workspace-label">Admin console</div>
      <nav className="workspace-nav" aria-label="Admin navigation">{navItems.map(({ href, label, icon: Icon, key }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={pathname.startsWith(href) ? "active" : ""}><Icon size={18} /><span>{label}</span><kbd>{key}</kbd>{pathname.startsWith(href) && <ChevronRight size={15} />}</Link>)}</nav>
      <div className="workspace-nav workspace-nav-secondary"><Link href="/admin/audit" className={pathname === "/admin/audit" ? "active" : ""}><ClipboardList size={18} /><span>Audit trail</span></Link><Link href="/app/dashboard"><Activity size={18} /><span>Provider workspace</span></Link></div>
      <div className="admin-health"><span><i /> Platform operational</span><small>All marketplace systems</small></div>
      <form action={signOutAction}><button type="submit" className="workspace-signout"><LogOut size={17} /> Sign out</button></form>
    </aside>
    {open && <button className="workspace-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <div className="workspace-content"><header className="workspace-topbar"><button className="workspace-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div><small>Administration</small><strong>{current}</strong></div><Link href="/#services" className="workspace-market-link"><Search size={16} /> View marketplace</Link></header><main className="workspace-main admin-workspace-main">{children}</main></div>
  </div>;
}
