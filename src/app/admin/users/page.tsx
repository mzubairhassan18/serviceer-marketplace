import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { AdminUsersClient } from "@/components/admin/admin-users-client";

export default async function AdminUsersPage() {
  const supabase = createClient(await cookies());
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminUsersClient users={users ?? []} />;
}
