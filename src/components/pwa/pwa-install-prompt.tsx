"use client";

import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || window.innerWidth > 760) return;
    const dismissedAt = Number(window.localStorage.getItem("serviceer-install-dismissed-at") || 0);
    if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;

    if (isIosDevice()) {
      const timer = window.setTimeout(() => {
        setShowIosHelp(true);
        setVisible(true);
      }, 1800);
      return () => window.clearTimeout(timer);
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible) return null;

  function dismiss() {
    window.localStorage.setItem("serviceer-install-dismissed-at", String(Date.now()));
    setVisible(false);
  }

  return (
    <aside style={{ position: "fixed", bottom: "1rem", left: "1rem", right: "1rem", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem", zIndex: 50, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} aria-label="Install Serviceer">
      <button onClick={dismiss} type="button" style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
        <X size={16} />
      </button>
      <div style={{ flex: 1 }}>
        <strong>Install Serviceer</strong>
        <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: 0 }}>
          {showIosHelp ? "Open Share, then choose Add to Home Screen." : "Install for faster access."}
        </p>
      </div>
      {showIosHelp ? (
        <Share2 size={18} />
      ) : (
        <button
          style={{ background: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: "var(--radius)", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}
          onClick={async () => {
            if (!installEvent) return;
            await installEvent.prompt();
            const choice = await installEvent.userChoice;
            if (choice.outcome === "accepted") setVisible(false);
            setInstallEvent(null);
          }}
          type="button"
        >
          <Download size={14} style={{ display: "inline", marginRight: "0.25rem" }} /> Install
        </button>
      )}
    </aside>
  );
}
