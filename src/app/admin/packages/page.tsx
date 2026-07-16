import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { PackagesClient } from "@/components/admin/admin-packages-client";

export default async function AdminPackagesPage() {
  const supabase = createClient(await cookies());
  const { data: packages } = await supabase
    .from("ad_packages")
    .select("*")
    .order("price_minor", { ascending: true });

  return <PackagesClient packages={packages ?? []} />;
}
