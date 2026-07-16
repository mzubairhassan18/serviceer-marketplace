"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export function ExploreServicesLink({ children, className, onExplore }: { children: React.ReactNode; className?: string; onExplore?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  function explore(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onExplore?.();
    if (pathname !== "/") {
      router.push("/#services");
      return;
    }
    router.replace("/#services", { scroll: false });
    window.dispatchEvent(new CustomEvent("serviceer:browse-all"));
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" })));
  }

  return <Link href="/#services" className={className} onClick={explore}>{children}</Link>;
}
