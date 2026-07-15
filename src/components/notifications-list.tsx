"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export function NotificationsList({ userId }: { userId: string }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) {
      setNotifications(data as Notification[]);
    }
    setLoading(false);
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
  }

  function handleClick(n: Notification) {
    if (!n.read_at) markAsRead(n.id);
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

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Notifications</h1>
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--muted-foreground)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          Notifications
          {unreadCount > 0 && (
            <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--muted-foreground)", marginLeft: "0.5rem" }}>
              ({unreadCount} unread)
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn btn-sm">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--muted-foreground)" }}>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleClick(n)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
                padding: "1rem",
                border: "1px solid var(--card-border)",
                borderRadius: "var(--radius)",
                background: n.read_at ? "var(--card)" : "var(--muted)",
                cursor: n.href ? "pointer" : "default",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: n.read_at ? 400 : 600, fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                  {n.title}
                </div>
                {n.body && (
                  <div style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                    {n.body}
                  </div>
                )}
                <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.35rem" }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem", flexShrink: 0 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                  {timeAgo(n.created_at)}
                </span>
                {!n.read_at && (
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    flexShrink: 0,
                  }} />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
