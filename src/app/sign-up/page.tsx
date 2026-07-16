import Link from "next/link";
import { Check, LockKeyhole, Mail, UserRound } from "lucide-react";
import { signUpAction } from "@/app/auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { FormSubmitButton } from "@/components/form-submit-button";

export default async function SignUpPage(props: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const { error, message, next = "/app" } = await props.searchParams;
  const signInHref = `/sign-in${next !== "/app" ? `?next=${encodeURIComponent(next)}` : ""}`;
  return <AuthShell eyebrow="Join the community" title="Make the next job easier." description="One account lets you hire trusted help or grow your own service business." footer={<>Already have an account? <Link href={signInHref}>Sign in</Link></>}>
    {error && <div className="auth-alert auth-alert-error">{error}</div>}{message && <div className="auth-alert auth-alert-success">{message}</div>}
    <form action={signUpAction} className="auth-form-modern"><input type="hidden" name="next" value={next} />
      <div className="auth-input"><label htmlFor="name">Full name</label><div><UserRound /><input id="name" name="name" type="text" autoComplete="name" required placeholder="How should we address you?" /></div></div>
      <div className="auth-input"><label htmlFor="email">Email address</label><div><Mail /><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></div></div>
      <div className="auth-input"><label htmlFor="password">Create a password</label><div><LockKeyhole /><input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" /></div><small><Check /> Use 8 or more characters</small></div>
      <FormSubmitButton pendingLabel="Creating your account…">Create account</FormSubmitButton>
      <p className="auth-terms">By continuing, you agree to use Serviceer respectfully and honestly.</p>
    </form>
  </AuthShell>;
}
