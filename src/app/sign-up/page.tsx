import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";

export default async function SignUpPage(props: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await props.searchParams;

  return (
    <div className="auth-card">
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Create an account</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        Join Serviceer as a buyer or provider
      </p>
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-message">{message}</div>}
      <form action={signUpAction} className="auth-form">
        <div className="auth-field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" placeholder="Your name" />
        </div>
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" />
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" />
        </div>
        <button className="auth-submit" type="submit">Create account</button>
      </form>
      <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
        Already have an account? <Link href="/sign-in" style={{ color: "var(--foreground)", fontWeight: 500 }}>Sign in</Link>
      </p>
    </div>
  );
}
