import Link from "next/link";
import { signInAction } from "@/app/auth/actions";

export default async function SignInPage(props: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await props.searchParams;

  return (
    <div className="auth-card">
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Welcome back</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        Sign in to Serviceer
      </p>
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-message">{message}</div>}
      <form action={signInAction} className="auth-form">
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" />
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Your password" />
        </div>
        <Link className="auth-forgot" href="/forgot-password">Forgot password?</Link>
        <button className="auth-submit" type="submit">Sign in</button>
      </form>
      <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
        New to Serviceer? <Link href="/sign-up" style={{ color: "var(--foreground)", fontWeight: 500 }}>Create an account</Link>
      </p>
    </div>
  );
}
