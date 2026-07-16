"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function authRedirect(path: string, type: "error" | "message", value: string, next?: string): never {
  const params = new URLSearchParams({ [type]: value });
  if (next && next !== "/app") params.set("next", next);
  redirect(`${path}?${params.toString()}`);
}

function safeNext(formData: FormData) {
  const next = field(formData, "next");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/app";
}

export async function signInAction(formData: FormData) {
  const email = field(formData, "email").toLowerCase();
  const password = field(formData, "password");
  const next = safeNext(formData);
  if (!email || !password) authRedirect("/sign-in", "error", "Enter your email and password.", next);
  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) authRedirect("/sign-in", "error", "The email or password is incorrect.", next);
  redirect(next);
}

export async function signUpAction(formData: FormData) {
  const name = field(formData, "name");
  const email = field(formData, "email").toLowerCase();
  const password = field(formData, "password");
  const next = safeNext(formData);
  if (!name || !email || password.length < 8) authRedirect("/sign-up", "error", "Enter your name, email, and a password of at least 8 characters.", next);
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) authRedirect("/sign-up", "error", error.message, next);
  if (data.session) redirect(next);
  authRedirect("/sign-in", "message", "Account created. Check your email to confirm your address, then sign in.", next);
}

export async function signOutAction() {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function signInWithGoogleAction(formData: FormData) {
  const next = safeNext(formData);
  const supabase = createClient(await cookies());
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (data.url) redirect(data.url);
  authRedirect("/sign-in", "error", "Google sign-in is not configured. Try email instead.", next);
}

export async function forgotPasswordAction(formData: FormData) {
  const email = field(formData, "email").toLowerCase();
  if (!email) authRedirect("/forgot-password", "error", "Enter your email address.");
  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/update-password`,
  });
  if (error) authRedirect("/forgot-password", "error", error.message);
  authRedirect("/sign-in", "message", "If that account exists, a password reset email has been sent.");
}

export async function updatePasswordAction(formData: FormData) {
  const password = field(formData, "password");
  if (password.length < 8) authRedirect("/update-password", "error", "Use a password of at least 8 characters.");
  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.updateUser({ password });
  if (error) authRedirect("/update-password", "error", error.message);
  redirect("/app");
}
