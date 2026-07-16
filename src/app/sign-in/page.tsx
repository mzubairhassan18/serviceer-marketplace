import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";
import { signInAction, signInWithGoogleAction } from "@/app/auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { FormSubmitButton } from "@/components/form-submit-button";

export default async function SignInPage(props: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const { error, message, next = "/app" } = await props.searchParams;
  const signUpHref = `/sign-up${next !== "/app" ? `?next=${encodeURIComponent(next)}` : ""}`;
  return <AuthShell eyebrow="Welcome back" title="Pick up where you left off." description="Sign in to manage conversations, orders, and the work that matters." footer={<>New to Serviceer? <Link href={signUpHref}>Create your account</Link></>}>
    {error && <div className="auth-alert auth-alert-error">{error}</div>}{message && <div className="auth-alert auth-alert-success">{message}</div>}
    <form action={signInWithGoogleAction}><input type="hidden" name="next" value={next} /><FormSubmitButton className="auth-social-button" pendingLabel="Connecting…"><span className="google-mark">G</span> Continue with Google</FormSubmitButton></form>
    <div className="auth-divider"><span>or continue with email</span></div>
    <form action={signInAction} className="auth-form-modern"><input type="hidden" name="next" value={next} />
      <div className="auth-input"><label htmlFor="email">Email address</label><div><Mail /><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></div></div>
      <div className="auth-input"><div className="auth-label-row"><label htmlFor="password">Password</label><Link href="/forgot-password">Forgot password?</Link></div><div><LockKeyhole /><input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" /></div></div>
      <FormSubmitButton pendingLabel="Signing you in…">Sign in</FormSubmitButton>
    </form>
  </AuthShell>;
}
