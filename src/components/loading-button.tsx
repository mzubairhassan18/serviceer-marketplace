"use client";

import { useState } from "react";

interface LoadingButtonProps {
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function LoadingButton({ onClick, disabled, className = "btn", type = "button", style, children }: LoadingButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await onClick?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${className}${loading ? " loading" : ""}`}
      style={style}
    >
      <span className="spinner" />
      <span className="btn-label">{children}</span>
    </button>
  );
}
