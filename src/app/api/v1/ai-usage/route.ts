import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const minuteAgo = new Date(now.getTime() - 60_000).toISOString();

  const [todayRows, minuteRows] = await Promise.all([
    supabase
      .from("ai_usage_events")
      .select("model, feature, input_tokens, output_tokens")
      .gte("created_at", todayStart),
    supabase
      .from("ai_usage_events")
      .select("id", { count: "exact", head: false })
      .gte("created_at", minuteAgo),
  ]);

  const todayData = todayRows.data ?? [];
  const minuteRequests = minuteRows.count ?? 0;

  const byFeature: Record<string, { requests: number; tokens: number }> = {};
  const byModel: Record<string, { requests: number; tokens: number }> = {};

  for (const row of todayData) {
    const tokens = (row.input_tokens ?? 0) + (row.output_tokens ?? 0);

    if (!byFeature[row.feature]) byFeature[row.feature] = { requests: 0, tokens: 0 };
    byFeature[row.feature].requests++;
    byFeature[row.feature].tokens += tokens;

    if (!byModel[row.model]) byModel[row.model] = { requests: 0, tokens: 0 };
    byModel[row.model].requests++;
    byModel[row.model].tokens += tokens;
  }

  return NextResponse.json({
    today_requests: todayData.length,
    today_tokens: todayData.reduce((sum, r) => sum + (r.input_tokens ?? 0) + (r.output_tokens ?? 0), 0),
    minute_requests: minuteRequests,
    by_feature: byFeature,
    by_model: byModel,
  });
}
