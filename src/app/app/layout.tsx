import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const { data: userData } = await supabase.auth.getUser();
    const name = userData.user?.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({ id: user.id, name, email: user.email!, role: "buyer" })
      .select()
      .single();
    profile = newProfile;
  }

  return (
    <AppShell user={{ email: user.email!, name: profile?.name ?? "User" }}>
      {children}
    </AppShell>
  );
}
