import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export type AiFeature =
  | "chat"
  | "gig_description"
  | "price_suggestion"
  | "category_suggestion"
  | "dispute_analysis"
  | "embedding"
  | "semantic_search";

export interface UsageEvent {
  model: string;
  feature: AiFeature;
  input_tokens?: number;
  output_tokens?: number;
  duration_ms?: number;
  success?: boolean;
  error_message?: string;
}

export interface UsageStats {
  today_requests: number;
  today_tokens: number;
  minute_requests: number;
  by_feature: Record<string, { requests: number; tokens: number }>;
  by_model: Record<string, { requests: number; tokens: number }>;
}

export const MODEL_LIMITS: Record<string, { rpm: number; rpd: number; tpm: number }> = {
  "gemini-2.5-flash-lite": { rpm: 15, rpd: 1000, tpm: 250000 },
  "gemini-2.5-flash": { rpm: 10, rpd: 250, tpm: 250000 },
  "gemini-embedding-001": { rpm: 100, rpd: 1000, tpm: 30000 },
};

export async function logAiUsage(event: UsageEvent) {
  try {
    await supabase.from("ai_usage_events").insert({
      model: event.model,
      feature: event.feature,
      input_tokens: event.input_tokens ?? 0,
      output_tokens: event.output_tokens ?? 0,
      duration_ms: event.duration_ms ?? 0,
      success: event.success ?? true,
      error_message: event.error_message ?? null,
    });
  } catch {
    // Silent — usage tracking should never break the app
  }
}

export async function trackAiCall<T>(
  model: string,
  feature: AiFeature,
  fn: () => Promise<T>,
  extractTokens?: (result: T) => { input: number; output: number }
): Promise<T> {
  const start = Date.now();
  let success = true;
  let errorMessage: string | null = null;
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    const result = await fn();
    if (extractTokens) {
      const tokens = extractTokens(result);
      inputTokens = tokens.input;
      outputTokens = tokens.output;
    }
    return result;
  } catch (err: any) {
    success = false;
    errorMessage = err.message?.slice(0, 500) ?? "Unknown error";
    throw err;
  } finally {
    logAiUsage({
      model,
      feature,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      duration_ms: Date.now() - start,
      success,
      error_message: errorMessage ?? undefined,
    });
  }
}

export async function getUsageStats(): Promise<UsageStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const minuteAgo = new Date(now.getTime() - 60_000).toISOString();

  const [todayResult, minuteResult, featureResult, modelResult] = await Promise.all([
    supabase
      .from("ai_usage_events")
      .select("id, output_tokens", { count: "exact", head: false })
      .gte("created_at", todayStart),
    supabase
      .from("ai_usage_events")
      .select("id", { count: "exact", head: false })
      .gte("created_at", minuteAgo),
    supabase
      .from("ai_usage_events")
      .select("feature, input_tokens, output_tokens")
      .gte("created_at", todayStart),
    supabase
      .from("ai_usage_events")
      .select("model, input_tokens, output_tokens")
      .gte("created_at", todayStart),
  ]);

  const todayRequests = todayResult.count ?? 0;
  const todayTokens = (todayResult.data ?? []).reduce(
    (sum, r) => sum + (r.output_tokens ?? 0),
    0
  );
  const minuteRequests = minuteResult.count ?? 0;

  const byFeature: Record<string, { requests: number; tokens: number }> = {};
  for (const row of featureResult.data ?? []) {
    if (!byFeature[row.feature]) byFeature[row.feature] = { requests: 0, tokens: 0 };
    byFeature[row.feature].requests++;
    byFeature[row.feature].tokens += (row.input_tokens ?? 0) + (row.output_tokens ?? 0);
  }

  const byModel: Record<string, { requests: number; tokens: number }> = {};
  for (const row of modelResult.data ?? []) {
    if (!byModel[row.model]) byModel[row.model] = { requests: 0, tokens: 0 };
    byModel[row.model].requests++;
    byModel[row.model].tokens += (row.input_tokens ?? 0) + (row.output_tokens ?? 0);
  }

  return {
    today_requests: todayRequests,
    today_tokens: todayTokens,
    minute_requests: minuteRequests,
    by_feature: byFeature,
    by_model: byModel,
  };
}
