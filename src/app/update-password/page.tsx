import { Check, LockKeyhole } from "lucide-react";
import { updatePasswordAction } from "@/app/auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { FormSubmitButton } from "@/components/form-submit-button";

export default async function UpdatePasswordPage(props: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await props.searchParams;
  return <AuthShell compact eyebrow="Secure your account" title="Choose a new password." description="Create a password you haven’t used before for this account.">
    {error && <div className="auth-alert auth-alert-error">{error}</div>}{message && <div className="auth-alert auth-alert-success">{message}</div>}
    <form action={updatePasswordAction} className="auth-form-modern"><div className="auth-input"><label htmlFor="password">New password</label><div><LockKeyhole /><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required placeholder="At least 8 characters" /></div><small><Check /> Use 8 or more characters</small></div><FormSubmitButton pendingLabel="Updating password…">Update password</FormSubmitButton></form>
  </AuthShell>;
}
