import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serviceer — Service Marketplace",
  description: "Find trusted service providers for plumbing, electrical, cleaning, and more.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="site-logo">Serviceer</Link>
          <nav className="site-nav">
            <Link href="/gigs">Browse</Link>
            {user ? (
              <>
                <Link href="/app">Dashboard</Link>
                {isAdmin && <Link href="/admin/dashboard">Admin</Link>}
                <form action={signOutAction} style={{ display: "inline" }}>
                  <button type="submit" className="btn-primary-sm" style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer" }}>Sign out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/sign-in">Sign in</Link>
                <Link href="/sign-up" className="btn-primary-sm">Get started</Link>
              </>
            )}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
