"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Cpu, Zap } from "lucide-react";

interface UsageData {
  today_requests: number;
  today_tokens: number;
  minute_requests: number;
  by_feature: Record<string, { requests: number; tokens: number }>;
  by_model: Record<string, { requests: number; tokens: number }>;
}

interface Limit {
  rpm: number;
  rpd: number;
  tpm: number;
}

const MODEL_LIMITS: Record<string, Limit> = {
  "gemini-2.5-flash-lite": { rpm: 15, rpd: 1000, tpm: 250000 },
  "gemini-2.5-flash": { rpm: 10, rpd: 250, tpm: 250000 },
  "gemini-embedding-001": { rpm: 100, rpd: 1000, tpm: 30000 },
};

const FEATURE_LABELS: Record<string, string> = {
  chat: "Support Chat",
  gig_description: "Gig Description Gen",
  price_suggestion: "Price Suggestion",
  category_suggestion: "Category Suggestion",
  dispute_analysis: "Dispute Analysis",
  embedding: "Embedding",
  semantic_search: "Semantic Search",
};

function getLevel(pct: number): "ok" | "warn" | "danger" {
  if (pct >= 90) return "danger";
  if (pct >= 70) return "warn";
  return "ok";
}

function Bar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const level = getLevel(pct);

  const colors = {
    ok: "bg-emerald-500",
    warn: "bg-amber-500",
    danger: "bg-red-500",
  };

  const textColors = {
    ok: "text-emerald-600",
    warn: "text-amber-600",
    danger: "text-red-600",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${textColors[level]}`}>
          {used.toLocaleString()} / {limit.toLocaleString()}
          <span className="ml-1 text-muted-foreground">({Math.round(pct)}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colors[level]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function AiUsageCard() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/ai-usage")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">AI Usage</h2>
        </div>
        <div className="text-xs text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  const allModels = Object.keys(MODEL_LIMITS);
  const worstRpd = allModels.reduce((worst, model) => {
    const limit = MODEL_LIMITS[model];
    const modelData = data.by_model[model];
    const used = modelData?.requests ?? 0;
    const pct = limit.rpd > 0 ? (used / limit.rpd) * 100 : 0;
    return pct > worst.pct ? { model, used, limit: limit.rpd, pct } : worst;
  }, { model: "", used: 0, limit: 0, pct: 0 });

  return (
    <div className="admin-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">AI Usage (Gemini Free Tier)</h2>
        {worstRpd.pct >= 70 && (
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            Approaching limit
          </span>
        )}
      </div>

      {/* Daily limits per model */}
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            Daily Requests (RPD)
          </h3>
          <div className="space-y-2">
            {allModels.map((model) => {
              const limit = MODEL_LIMITS[model];
              const modelData = data.by_model[model];
              const used = modelData?.requests ?? 0;
              return (
                <Bar
                  key={model}
                  used={used}
                  limit={limit.rpd}
                  label={model}
                />
              );
            })}
          </div>
        </div>

        {/* Minute requests */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Activity className="h-3 w-3" />
            Requests / Minute
          </h3>
          <div className="space-y-2">
            {allModels.map((model) => {
              const limit = MODEL_LIMITS[model];
              return (
                <Bar
                  key={model}
                  used={data.minute_requests}
                  limit={limit.rpm}
                  label={model}
                />
              );
            })}
          </div>
        </div>

        {/* Token usage */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Cpu className="h-3 w-3" />
            Daily Tokens (TPM)
          </h3>
          <div className="space-y-2">
            {allModels.map((model) => {
              const limit = MODEL_LIMITS[model];
              const modelData = data.by_model[model];
              const used = modelData?.tokens ?? 0;
              return (
                <Bar
                  key={model}
                  used={used}
                  limit={limit.tpm}
                  label={model}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Breakdown by feature */}
      {Object.keys(data.by_feature).length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-2">By Feature (Today)</h3>
          <div className="space-y-1">
            {Object.entries(data.by_feature)
              .sort((a, b) => b[1].requests - a[1].requests)
              .map(([feature, stats]) => (
                <div key={feature} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {FEATURE_LABELS[feature] || feature}
                  </span>
                  <span className="font-medium">
                    {stats.requests} req
                    <span className="text-muted-foreground ml-1">
                      {stats.tokens > 0 ? `${(stats.tokens / 1000).toFixed(1)}k tok` : ""}
                    </span>
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {data.today_requests === 0 && (
        <div className="text-xs text-muted-foreground text-center py-2">
          No AI calls today
        </div>
      )}
    </div>
  );
}
