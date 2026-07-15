import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serviceer — Service Marketplace",
  description: "Find trusted service providers for plumbing, electrical, cleaning, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
