import { createClient } from "@/utils/supabase/server";

export async function createNotification(
  userId: string,
  notification: {
    title: string;
    body?: string;
    type: string;
    entity_type?: string;
    entity_id?: string;
    href?: string;
  }
) {
  const supabase = createClient(await (await import("next/headers")).cookies());
  await supabase.from("notifications").insert({
    user_id: userId,
    title: notification.title,
    body: notification.body || "",
    type: notification.type,
    entity_type: notification.entity_type || null,
    entity_id: notification.entity_id || null,
    href: notification.href || null,
  });
}
