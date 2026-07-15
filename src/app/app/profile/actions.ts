"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function upsertProviderProfileAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const bio = (formData.get("bio") as string) || "";
  const skillsRaw = (formData.get("skills") as string) || "";
  const skills = skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const years_experience = Number(formData.get("years_experience")) || 0;
  const website = (formData.get("website") as string) || "";

  const { error } = await supabase.from("provider_profiles").upsert(
    { id: user.id, bio, skills, years_experience, website },
    { onConflict: "id" }
  );

  if (error) throw new Error(error.message);
  redirect("/app/profile");
}
