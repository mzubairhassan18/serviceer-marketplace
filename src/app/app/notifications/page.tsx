import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { NotificationsList } from "@/components/notifications-list";

export default async function NotificationsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  return <NotificationsList userId={user!.id} />;
}
