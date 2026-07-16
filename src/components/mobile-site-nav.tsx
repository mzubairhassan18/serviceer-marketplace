"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function MobileSiteNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`mobile-nav-wrap${open ? " open" : ""}`}>
      <button className="mobile-menu" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      {open && <div className="mobile-nav-panel">
        <Link href="/#services" onClick={() => setOpen(false)}>Explore services</Link>
        <Link href="/sign-up" onClick={() => setOpen(false)}>Become a provider</Link>
        <Link href={signedIn ? "/app/dashboard" : "/sign-in"} onClick={() => setOpen(false)}>{signedIn ? "Open dashboard" : "Sign in"}</Link>
      </div>}
    </div>
  );
}
