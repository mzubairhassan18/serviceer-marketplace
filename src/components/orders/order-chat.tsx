"use client";

import { useState } from "react";
import type { Message } from "@/lib/types";
import { sendMessageAction } from "@/app/app/messages/actions";

export function OrderChat({ orderId, userId, initialMessages }: { orderId: string; userId: string; initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function sendMessage() {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
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

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "60vh" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
        {messages.length === 0 && (
          <p style={{ color: "var(--muted-foreground)", textAlign: "center", padding: "2rem" }}>
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === userId;
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "70%",
                padding: "0.625rem 1rem",
                borderRadius: "var(--radius)",
                background: isMe ? "var(--primary)" : "var(--muted)",
                color: isMe ? "var(--primary-foreground)" : "var(--foreground)",
                fontSize: "0.875rem",
              }}>
                {msg.body}
                <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: "0.25rem" }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
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
