"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function approveGigAction(formData: FormData) {
  const gigId = formData.get("gigId") as string;
  const supabase = createClient(await cookies());
  await supabase.from("gigs").update({ status: "approved" }).eq("id", gigId);
  revalidatePath("/admin/gigs");
}

export async function rejectGigAction(formData: FormData) {
  const gigId = formData.get("gigId") as string;
  const supabase = createClient(await cookies());
  await supabase.from("gigs").update({ status: "rejected" }).eq("id", gigId);
  revalidatePath("/admin/gigs");
}
