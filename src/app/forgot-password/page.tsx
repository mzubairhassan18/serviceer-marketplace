import Link from "next/link";
import { forgotPasswordAction } from "@/app/auth/actions";

export default async function ForgotPasswordPage(props: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await props.searchParams;

  return (
    <div className="auth-card">
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Reset password</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        Enter your email to receive a reset link.
      </p>
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-message">{message}</div>}
      <form action={forgotPasswordAction} className="auth-form">
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
        </div>
        <button className="auth-submit" type="submit">Send reset link</button>
      </form>
      <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem" }}>
        <Link href="/sign-in" style={{ color: "var(--muted-foreground)" }}>Back to sign in</Link>
      </p>
    </div>
  );
}
