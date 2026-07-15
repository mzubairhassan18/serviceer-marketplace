"use client";

import { useEffect } from "react";

const START = "svc:navigation-start";
const FINISH = "svc:navigation-finish";

function getWrap() {
  return document.getElementById("np-wrap");
}

function getBar() {
  return document.getElementById("np-bar");
}

export function startNavigationProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(START));
  }
}

export function finishNavigationProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FINISH));
  }
}

function installHistoryPatch(handler: () => void) {
  const origPush = history.pushState;
  const origReplace = history.replaceState;
  history.pushState = function (...args) {
    handler();
    return origPush.apply(this, args);
  };
  history.replaceState = function (...args) {
    handler();
    return origReplace.apply(this, args);
  };
  return () => {
    history.pushState = origPush;
    history.replaceState = origReplace;
  };
}

function start() {
  const wrap = getWrap();
  const bar = getBar();
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

export function NavigationProgress() {
  useEffect(() => {
    let prev = location.pathname + location.search;
    let hideTimer: ReturnType<typeof setTimeout>;

    const onPathChange = () => {
      const now = location.pathname + location.search;
      if (now !== prev) {
        prev = now;
        clearTimeout(hideTimer);
        hideTimer = setTimeout(finish, 50);
      }
    };

    const uninstallHistory = installHistoryPatch(start);

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
    }

    window.addEventListener(START, start);
    window.addEventListener(FINISH, finish);
    window.addEventListener("popstate", onPathChange);
    document.addEventListener("click", onClick, { capture: true });

    return () => {
      uninstallHistory();
      clearTimeout(hideTimer);
      window.removeEventListener(START, start);
      window.removeEventListener(FINISH, finish);
      window.removeEventListener("popstate", onPathChange);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return (
    <div id="np-wrap" aria-hidden="true">
      <span id="np-bar" />
    </div>
  );
}
