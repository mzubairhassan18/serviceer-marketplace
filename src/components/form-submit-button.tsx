"use client";

import { useFormStatus } from "react-dom";

export function FormSubmitButton({ children, pendingLabel = "Please wait…", className = "auth-submit" }: { children: React.ReactNode; pendingLabel?: string; className?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={`${className}${pending ? " loading" : ""}`} disabled={pending} aria-busy={pending}>
    <span className="form-button-spinner" />
    <span>{pending ? pendingLabel : children}</span>
  </button>;
}
