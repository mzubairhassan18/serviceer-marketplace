"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Brain, Cpu, Info, Zap } from "lucide-react";

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

const FEATURE_INFO: Record<string, string> = {
  chat: "Customer support chatbot answering platform questions",
  gig_description: "AI-generated service descriptions from title & category",
  price_suggestion: "Market-aware pricing recommendations based on similar gigs",
  category_suggestion: "Auto-classifies gigs into the right service category",
  dispute_analysis: "AI-assisted dispute resolution analysis with recommendations",
  embedding: "Vector embeddings for gig semantic search (auto on approval)",
  semantic_search: "Finds gigs by meaning, not just keywords",
};

function getLevel(pct: number): "ok" | "warn" | "danger" {
  if (pct >= 90) return "danger";
  if (pct >= 70) return "warn";
  return "ok";
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="ai-tooltip-wrapper">
      {children}
      <span className="ai-tooltip">{text}</span>
    </span>
  );
}

function Bar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const level = getLevel(pct);

  const colors = { ok: "bg-emerald-500", warn: "bg-amber-500", danger: "bg-red-500" };
  const textColors = { ok: "text-emerald-600", warn: "text-amber-600", danger: "text-red-600" };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground truncate mr-2">{label}</span>
        <span className={`font-medium whitespace-nowrap ${textColors[level]}`}>
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
      <div className="ai-usage-section">
        <div className="ai-usage-header">
          <Brain className="h-4 w-4" />
          <h2>AI Engine</h2>
        </div>
        <div className="metric-grid ai-usage-metrics">
          {[1, 2, 3].map((i) => (
            <div key={i} className="metric-card ai-usage-metric-skeleton">
              <span className="metric-icon"><Cpu /></span>
              <div><small>&nbsp;</small><strong>--</strong><p>Loading...</p></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Compute worst RPD across all models
  const allModels = Object.keys(MODEL_LIMITS);
  const worstRpd = allModels.reduce((worst, model) => {
    const limit = MODEL_LIMITS[model];
    const modelData = data.by_model[model];
    const used = modelData?.requests ?? 0;
    const pct = limit.rpd > 0 ? (used / limit.rpd) * 100 : 0;
    return pct > worst.pct ? { model, used, limit: limit.rpd, pct } : worst;
  }, { model: "", used: 0, limit: 0, pct: 0 });

  // Total tokens today across all models
  const totalTokensToday = Object.values(data.by_model).reduce((s, m) => s + m.tokens, 0);
  // Max TPM across models
  const maxTpm = Math.max(...allModels.map((m) => MODEL_LIMITS[m].tpm));

  // Total requests across all models today
  const totalRequestsToday = Object.values(data.by_model).reduce((s, m) => s + m.requests, 0);
  const maxRpd = Math.max(...allModels.map((m) => MODEL_LIMITS[m].rpd));

  const rpdPct = maxRpd > 0 ? Math.round((totalRequestsToday / maxRpd) * 100) : 0;
  const rpmPct = Math.round((data.minute_requests / 15) * 100); // 15 = flash-lite RPM
  const tpmPct = maxTpm > 0 ? Math.round((totalTokensToday / maxTpm) * 100) : 0;

  const featureCount = Object.keys(data.by_feature).length;

  return (
    <div className="ai-usage-section">
      <div className="ai-usage-header">
        <Brain className="h-4 w-4" />
        <h2>AI Engine</h2>
        {worstRpd.pct >= 70 && (
          <span className="ai-usage-warning-badge">
            <AlertTriangle className="h-3 w-3" />
            Approaching daily limit
          </span>
        )}
      </div>

      {/* Metric cards row — same style as dashboard metrics */}
      <div className="metric-grid ai-usage-metrics">
        <div className="metric-card">
          <span className="metric-icon"><Zap /></span>
          <div>
            <small>Today&apos;s Requests</small>
            <strong>{totalRequestsToday}</strong>
            <p>
              <span className={rpdPct >= 70 ? "text-amber-600" : ""}>{rpdPct}%</span> of daily limit
              <Tooltip text="Total AI API calls made today. Free tier allows ~1,000 requests/day for text models and ~1,000/day for embeddings. Resets at midnight Pacific Time.">
                <Info className="ai-info-icon" />
              </Tooltip>
            </p>
          </div>
        </div>
        <div className="metric-card">
          <span className="metric-icon"><Activity /></span>
          <div>
            <small>Per-Minute Rate</small>
            <strong>{data.minute_requests}</strong>
            <p>
              <span className={rpmPct >= 70 ? "text-amber-600" : ""}>{rpmPct}%</span> of RPM cap
              <Tooltip text="Requests in the last 60 seconds. Text models cap at 10-15 req/min, embeddings at 100 req/min. Spikes above this will get throttled.">
                <Info className="ai-info-icon" />
              </Tooltip>
            </p>
          </div>
        </div>
        <div className="metric-card">
          <span className="metric-icon"><Cpu /></span>
          <div>
            <small>Tokens Used Today</small>
            <strong>{totalTokensToday > 1000 ? `${(totalTokensToday / 1000).toFixed(1)}k` : totalTokensToday}</strong>
            <p>
              <span className={tpmPct >= 70 ? "text-amber-600" : ""}>{tpmPct}%</span> of token budget
              <Tooltip text="Tokens consumed today. ~1 token ≈ 4 characters of English text. Free tier allows 250k tokens/min for text and 30k/min for embeddings.">
                <Info className="ai-info-icon" />
              </Tooltip>
            </p>
          </div>
        </div>
        <div className="metric-card">
          <span className="metric-icon"><Brain /></span>
          <div>
            <small>Features Active</small>
            <strong>{featureCount}</strong>
            <p>
              of 7 AI features used
              <Tooltip text="AI features: Support Chat, Gig Description Gen, Price Suggestion, Category Suggestion, Dispute Analysis, Embedding, Semantic Search.">
                <Info className="ai-info-icon" />
              </Tooltip>
            </p>
          </div>
        </div>
      </div>

      {/* Detailed limits */}
      <div className="ai-usage-details">
        <div className="ai-usage-detail-section">
          <h3>
            <Zap className="h-3 w-3" />
            Daily Requests per Model
            <Tooltip text="How many requests each Gemini model has used today vs its free tier daily limit (RPD). Resets at midnight Pacific Time.">
              <Info className="ai-info-icon" />
            </Tooltip>
          </h3>
          <div className="space-y-2">
            {allModels.map((model) => {
              const limit = MODEL_LIMITS[model];
              const modelData = data.by_model[model];
              const used = modelData?.requests ?? 0;
              return <Bar key={model} used={used} limit={limit.rpd} label={model} />;
            })}
          </div>
        </div>

        <div className="ai-usage-detail-section">
          <h3>
            <Activity className="h-3 w-3" />
            Requests / Minute
            <Tooltip text="Current request rate across all models in the last 60 seconds. If this exceeds the RPM limit, new requests will be queued or rejected by Gemini.">
              <Info className="ai-info-icon" />
            </Tooltip>
          </h3>
          <div className="space-y-2">
            {allModels.map((model) => (
              <Bar key={model} used={data.minute_requests} limit={MODEL_LIMITS[model].rpm} label={model} />
            ))}
          </div>
        </div>

        <div className="ai-usage-detail-section">
          <h3>
            <Cpu className="h-3 w-3" />
            Token Consumption
            <Tooltip text="Tokens consumed per model today vs per-minute token limit. Text models: 250k TPM. Embeddings: 30k TPM. One token ≈ 4 characters.">
              <Info className="ai-info-icon" />
            </Tooltip>
          </h3>
          <div className="space-y-2">
            {allModels.map((model) => {
              const limit = MODEL_LIMITS[model];
              const modelData = data.by_model[model];
              const used = modelData?.tokens ?? 0;
              return <Bar key={model} used={used} limit={limit.tpm} label={model} />;
            })}
          </div>
        </div>
      </div>

      {/* Feature breakdown */}
      {featureCount > 0 && (
        <div className="ai-usage-features">
          <h3>Usage by Feature (Today)</h3>
          <div className="ai-usage-feature-grid">
            {Object.entries(data.by_feature)
              .sort((a, b) => b[1].requests - a[1].requests)
              .map(([feature, stats]) => (
                <div key={feature} className="ai-usage-feature-item">
                  <div className="ai-usage-feature-header">
                    <span className="ai-usage-feature-name">
                      {FEATURE_LABELS[feature] || feature}
                    </span>
                    <Tooltip text={FEATURE_INFO[feature] || "AI-powered feature"}>
                      <Info className="ai-info-icon" />
                    </Tooltip>
                  </div>
                  <div className="ai-usage-feature-stats">
                    <span>{stats.requests} req</span>
                    {stats.tokens > 0 && <span>{(stats.tokens / 1000).toFixed(1)}k tok</span>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {data.today_requests === 0 && (
        <div className="ai-usage-empty">
          No AI calls recorded today. Calls will appear here as features are used.
        </div>
      )}
    </div>
  );
}
