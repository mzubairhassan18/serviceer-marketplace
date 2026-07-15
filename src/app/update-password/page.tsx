import { updatePasswordAction } from "@/app/auth/actions";

export default async function UpdatePasswordPage(props: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await props.searchParams;

  return (
    <div className="auth-card">
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Update password</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        Enter your new password.
      </p>
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-message">{message}</div>}
      <form action={updatePasswordAction} className="auth-form">
        <div className="auth-field">
          <label htmlFor="password">New password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="At least 8 characters" />
        </div>
        <button className="auth-submit" type="submit">Update password</button>
      </form>
    </div>
  );
}
