"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n) => !n.read_at).length);
    }
  }

  async function markAsRead(id: string) {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  async function markAllRead() {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    setNotifications((prev) =>
      prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);
  }

  function handleClick(n: Notification) {
    if (!n.read_at) markAsRead(n.id);
    setOpen(false);
    if (n.href) router.push(n.href);
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.4rem",
          display: "flex",
          alignItems: "center",
          color: "var(--muted-foreground)",
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "#dc2626",
              color: "white",
              fontSize: "0.65rem",
              fontWeight: 700,
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            width: "380px",
            maxHeight: "480px",
            overflowY: "auto",
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: "var(--radius)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Notifications</span>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
              No notifications yet.
            </div>
          ) : (
            <>
              {notifications.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid var(--border)",
                    background: n.read_at ? "var(--card)" : "var(--muted)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: n.read_at ? 400 : 600, fontSize: "0.875rem", marginBottom: "0.15rem" }}>
                        {n.title}
                      </div>
                      {n.body && (
                        <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {n.body}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {timeAgo(n.created_at)}
                    </div>
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setOpen(false); router.push("/app/notifications"); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                  padding: "0.75rem 1rem",
                  background: "var(--card)",
                  color: "var(--accent)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderTop: "1px solid var(--border)",
                }}
              >
                View all notifications
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
