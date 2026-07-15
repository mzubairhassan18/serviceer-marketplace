import Link from "next/link";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serviceer — Service Marketplace",
  description: "Find trusted service providers for plumbing, electrical, cleaning, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="site-logo">Serviceer</Link>
          <nav className="site-nav">
            <Link href="/gigs">Browse</Link>
            <Link href="/sign-in">Sign in</Link>
            <Link href="/sign-up" className="btn-primary-sm">Get started</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
