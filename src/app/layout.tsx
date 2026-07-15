import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import { NavigationProgress } from "@/components/navigation-progress";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderSearch } from "@/components/header-search";
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NavigationProgress />
          <header className="site-header">
            <div className="header-left">
              <HeaderSearch />
            </div>
            <Link href="/" className="header-center">Serviceer</Link>
            <div className="header-right">
              <ThemeToggle />
              {user ? (
                <>
                  <NotificationBell userId={user.id} />
                  <Link href="/app" className="btn btn-sm">Dashboard</Link>
                  {isAdmin && <Link href="/admin/dashboard" className="btn btn-sm btn-ghost">Admin</Link>}
                  <form action={signOutAction} style={{ display: "inline" }}>
                    <button type="submit" className="btn btn-sm btn-ghost">Sign out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/sign-in" className="btn btn-sm btn-ghost">Sign in</Link>
                  <Link href="/sign-up" className="btn btn-sm btn-primary">Get started</Link>
                </>
              )}
            </div>
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
