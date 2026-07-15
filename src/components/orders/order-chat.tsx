"use client";

import { useState } from "react";
import { User, Shield } from "lucide-react";

interface Sender {
  id: string;
  name: string;
  role?: string;
}

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at?: string | null;
}

interface OrderChatProps {
  orderId: string;
  userId: string;
  initialMessages: Message[];
  senders?: Record<string, Sender>;
  currentUserName?: string;
}

export function OrderChat({ orderId, userId, initialMessages, senders = {}, currentUserName }: OrderChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function sendMessage() {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const { sendMessageAction } = await import("@/app/app/messages/actions");
      const msg = await sendMessageAction(orderId, body.trim());
      if (msg) {
        setMessages((prev) => [...prev, msg as unknown as Message]);
        setBody("");
      }
    } catch {
      // silently fail
    }
    setSending(false);
  }

  function getSenderName(senderId: string): string {
    if (senders[senderId]) return senders[senderId].name;
    if (senderId === userId) return currentUserName || "You";
    return "Unknown";
  }

  function getSenderRole(senderId: string): string | undefined {
    return senders[senderId]?.role;
  }

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "60vh" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}>
        {messages.length === 0 && (
          <p style={{ color: "var(--muted-foreground)", textAlign: "center", padding: "2rem" }}>
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === userId;
          const senderName = getSenderName(msg.sender_id);
          const isAdmin = getSenderRole(msg.sender_id) === "admin";

          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                marginBottom: "0.2rem",
                fontSize: "0.7rem",
                color: "var(--muted-foreground)",
              }}>
                {!isMe && (
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: isAdmin ? "#dc2626" : "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {isAdmin ? <Shield size={10} color="white" /> : <User size={10} color="white" />}
                  </div>
                )}
                <span style={{ fontWeight: 500, color: isAdmin ? "#dc2626" : undefined }}>
                  {isMe ? "You" : senderName}
                  {isAdmin && !isMe ? " (Admin)" : ""}
                </span>
                <span>·</span>
                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div style={{
                maxWidth: "70%",
                padding: "0.625rem 1rem",
                borderRadius: "var(--radius)",
                background: isMe ? "var(--primary)" : (isAdmin ? "#fef2f2" : "var(--muted)"),
                color: isMe ? "var(--primary-foreground)" : (isAdmin ? "#7f1d1d" : "var(--foreground)"),
                fontSize: "0.875rem",
                border: isAdmin && !isMe ? "1px solid #fecaca" : undefined,
              }}>
                {msg.body}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", padding: "0 1rem 1rem" }}>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "0.625rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.875rem" }}
        />
        <button onClick={sendMessage} disabled={sending || !body.trim()} className="btn btn-primary" type="button">
          Send
        </button>
      </div>
    </div>
  );
}
