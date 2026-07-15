"use client";

import { useState } from "react";

export function PasskeySignInButton() {
  const [loading, setLoading] = useState(false);

  async function handlePasskeySignIn() {
    setLoading(true);
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: "placeholder@example.com",
        password: "placeholder",
      });
      if (error) console.error("Passkey sign-in error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePasskeySignIn}
      disabled={loading}
      style={{
        width: "100%",
        marginTop: "0.75rem",
        padding: "0.625rem 1rem",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--background)",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: 500,
      }}
    >
      {loading ? "Signing in..." : "Sign in with Passkey"}
    </button>
  );
}

export function PasskeyRegisterButton() {
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      console.log("Passkey registration not yet implemented");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRegister}
      disabled={loading}
      className="btn"
    >
      {loading ? "Registering..." : "Register Passkey"}
    </button>
  );
}
