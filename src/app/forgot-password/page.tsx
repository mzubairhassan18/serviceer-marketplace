import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { forgotPasswordAction } from "@/app/auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { FormSubmitButton } from "@/components/form-submit-button";

export default async function ForgotPasswordPage(props: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await props.searchParams;
  return <AuthShell compact eyebrow="Account recovery" title="Let’s get you back in." description="Enter the email connected to your account and we’ll send a secure reset link." footer={<Link href="/sign-in" className="auth-back"><ArrowLeft /> Back to sign in</Link>}>
    {error && <div className="auth-alert auth-alert-error">{error}</div>}{message && <div className="auth-alert auth-alert-success">{message}</div>}
    <form action={forgotPasswordAction} className="auth-form-modern"><div className="auth-input"><label htmlFor="email">Email address</label><div><Mail /><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></div></div><FormSubmitButton pendingLabel="Sending reset link…">Send reset link</FormSubmitButton></form>
  </AuthShell>;
}
