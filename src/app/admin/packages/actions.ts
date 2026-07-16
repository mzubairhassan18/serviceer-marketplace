"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { logAuditEvent } from "@/lib/audit";

export async function updatePackageAction(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: admin } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (admin?.role !== "admin") throw new Error("Not authorized");

  const packageId = formData.get("packageId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const pricePaisa = formData.get("price") as string;
  const durationDays = formData.get("durationDays") as string;
  const isActive = formData.get("isActive") === "true";

  if (!packageId || !name || !pricePaisa) throw new Error("Missing required fields");

  const price = Math.round(parseFloat(pricePaisa) * 100);

  const { error } = await supabase
    .from("ad_packages")
    .update({
      name,
      description,
      price_minor: price,
      duration_days: parseInt(durationDays || "30"),
      is_active: isActive,
    })
    .eq("id", packageId);

  if (error) throw new Error(error.message);

  await logAuditEvent("package_updated", "package", packageId, `Updated package: ${name}`);
  revalidatePath("/admin/packages");
  revalidatePath("/admin/analytics");
}
