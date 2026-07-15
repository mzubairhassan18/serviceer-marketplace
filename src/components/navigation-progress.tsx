"use client";

import { useEffect } from "react";

function getWrap() {
  return document.getElementById("np-wrap");
}

function getBar() {
  return document.getElementById("np-bar");
}

function start() {
  const bar = getBar();
  const wrap = getWrap();
  if (bar) bar.style.transform = "";
  if (wrap) wrap.classList.add("visible");
}

function finish() {
  const wrap = getWrap();
  const bar = getBar();
  if (wrap) wrap.classList.add("finishing");
  setTimeout(() => {
    const el = getWrap();
    const b = getBar();
    if (el) el.classList.remove("visible", "finishing");
    if (b) b.style.transform = "scaleX(0)";
  }, 180);
}

function waitForUrlChange(from: string, cb: () => void) {
  let checks = 0;
  const max = 40;
  function tick() {
    checks++;
    if (location.pathname + location.search !== from || checks >= max) {
      cb();
    } else {
      setTimeout(tick, checks < 8 ? 50 : 150);
    }
  }
  tick();
}

export function NavigationProgress() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      try {
        const dest = new URL(a.href, location.href);
        if (dest.origin !== location.origin) return;
        if (dest.pathname === location.pathname && dest.search === location.search) return;
      } catch {
        return;
      }
      start();
      waitForUrlChange(location.pathname + location.search, finish);
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return (
    <div id="np-wrap" aria-hidden="true">
      <span id="np-bar" />
    </div>
  );
}
