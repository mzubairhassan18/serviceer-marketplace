# AI Implementation Plan — Serviceer Marketplace

## Executive Summary

This plan covers implementing AI features in your service marketplace using **Google Gemini API** (free tier). Starting with the most impactful (Smart Search with RAG) and progressing to other features.

**Total estimated cost: $0/month** (Gemini free tier covers moderate usage)

---

## Why Gemini?

| Feature | OpenAI | Gemini |
|---------|--------|--------|
| Free tier | $5 credit only | 60 req/min, 1M tokens/day |
| Embeddings | $0.02/1M tokens | Free |
| Chat | $0.15/1M tokens | Free |
| Quality | Excellent | Very good |
| **Verdict** | Paid | **Free for your scale** |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Next.js App                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React)  ←→  Server Actions  ←→  Supabase        │
│                            ↓                      ↓         │
│                    ┌───────────────┐    ┌───────────────┐   │
│                    │  Gemini API   │    │   pgvector    │   │
│                    │  (Chat + Emb) │    │  (Embeddings) │   │
│                    └───────────────┘    └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature 1: Smart Search with RAG (Retrieval-Augmented Generation)

### What It Does
Replaces keyword-based search with semantic understanding. User searches "emergency leak fix" → finds "plumbing services" even though keywords don't match.

### How It Works
1. **Embedding Generation**: Convert gig descriptions to 768-number vectors using Gemini
2. **Vector Storage**: Store vectors in Supabase with pgvector extension
3. **Semantic Search**: Convert user query to vector, find similar gig vectors using cosine similarity
4. **Optional AI Summary**: AI summarizes top results in natural language

### Implementation Steps

#### Step 1: Enable pgvector in Supabase
**One-time setup, free**

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Step 2: Create Embeddings Table
**New migration file: `drizzle/0002_add_gig_embeddings.sql`**

```sql
CREATE TABLE gig_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE UNIQUE,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX gig_embeddings_gig_idx ON gig_embeddings(gig_id);
CREATE INDEX gig_embeddings_vector_idx ON gig_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

#### Step 3: Add to Drizzle Schema
**Modify `src/db/schema.ts`**

```typescript
import { vector } from "drizzle-orm/pg-core";

export const gigEmbeddings = pgTable("gig_embeddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  gigId: uuid("gig_id").notNull().references(() => gigs.id, { onDelete: "cascade" }).unique(),
  embedding: vector("embedding", { dimensions: 768 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

#### Step 4: Create Embedding Service
**New file: `src/lib/embeddings.ts`**

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export async function storeGigEmbedding(gigId: string) {
  const supabase = createClient(await (await import("next/headers")).cookies());
  
  const { data: gig } = await supabase
    .from("gigs")
    .select("title, description, category, tags")
    .eq("id", gigId)
    .single();
  
  if (!gig) throw new Error("Gig not found");
  
  const text = `${gig.title} ${gig.description} ${gig.category} ${(gig.tags || []).join(" ")}`;
  const embedding = await generateEmbedding(text);
  
  await supabase.from("gig_embeddings").upsert({
    gig_id: gigId,
    embedding: embedding,
  });
}

export async function findSimilarGigs(queryEmbedding: number[], limit = 10) {
  const supabase = createClient(await (await import("next/headers")).cookies());
  
  const embeddingStr = `[${queryEmbedding.join(",")}]`;
  
  const { data, error } = await supabase.rpc("search_gigs_by_embedding", {
    query_embedding: embeddingStr,
    match_count: limit,
  });
  
  if (error) throw error;
  return data;
}
```

#### Step 5: Create Search Function in Supabase
**SQL function for similarity search**

```sql
CREATE OR REPLACE FUNCTION search_gigs_by_embedding(
  query_embedding vector(768),
  match_count int DEFAULT 10
)
RETURNS TABLE (
  gig_id uuid,
  similarity float,
  title text,
  description text,
  category text,
  price bigint,
  provider_name text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id as gig_id,
    1 - (ge.embedding <=> query_embedding) as similarity,
    g.title,
    g.description,
    g.category,
    g.price,
    p.name as provider_name
  FROM gig_embeddings ge
  JOIN gigs g ON g.id = ge.gig_id
  JOIN profiles p ON p.id = g.provider_id
  WHERE g.status = 'approved'
  ORDER BY ge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

#### Step 6: Create Search API Route
**New file: `src/app/api/v1/search/route.ts`** (replace existing)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding, findSimilarGigs } from "@/lib/embeddings";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  
  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }
  
  try {
    const queryEmbedding = await generateEmbedding(query);
    const results = await findSimilarGigs(queryEmbedding, 10);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
```

#### Step 7: Update Hero Search Component
**Modify `src/components/hero-search.tsx`**

Add AI search toggle and call the new API endpoint.

#### Step 8: Backfill Existing Gigs
**One-time script: `scripts/backfill-embeddings.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";
import { generateEmbedding } from "../src/lib/embeddings";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function backfill() {
  const { data: gigs } = await supabase
    .from("gigs")
    .select("id, title, description, category, tags")
    .eq("status", "approved");
  
  for (const gig of gigs || []) {
    const text = `${gig.title} ${gig.description} ${gig.category} ${(gig.tags || []).join(" ")}`;
    const embedding = await generateEmbedding(text);
    
    await supabase.from("gig_embeddings").upsert({
      gig_id: gig.id,
      embedding: embedding,
    });
    
    console.log(`Embedded: ${gig.title}`);
  }
}

backfill();
```

### Cost
- Embedding generation: **Free** (Gemini free tier)
- 1000 searches/month: **Free**
- **Total: $0/month**

---

## Feature 2: Gig Description Generator

### What It Does
Provider enters "I fix pipes" → AI generates professional description.

### Implementation Steps

#### Step 1: Update AI Service
**Modify `src/lib/ai.ts`**

```typescript
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateGigDescription(title: string, category: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const result = await model.generateContent(
    `Write a professional gig description for: "${title}" in the "${category}" category.
    
    Requirements:
    - Under 150 words
    - Professional and compelling
    - Include what the service covers
    - Mention what makes it quality
    - End with a call to action
    
    Respond with just the description, no quotes or extra text.`
  );
  
  return result.response.text();
}
```

#### Step 2: Create UI Component
**New file: `src/components/gig-description-generator.tsx`**

```typescript
"use client";

import { useState } from "react";
import { generateGigDescription } from "@/lib/ai";
import { LoadingButton } from "@/components/loading-button";

export function GigDescriptionGenerator({ 
  title, 
  category, 
  onAccept 
}: { 
  title: string;
  category: string;
  onAccept: (description: string) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  
  async function generate() {
    setGenerating(true);
    try {
      const desc = await generateGigDescription(title, category);
      setSuggestion(desc || "");
    } finally {
      setGenerating(false);
    }
  }
  
  return (
    <div>
      <LoadingButton 
        onClick={generate} 
        loading={generating}
        disabled={!title || !category}
      >
        Generate Description with AI
      </LoadingButton>
      
      {suggestion && (
        <div style={{ marginTop: "1rem" }}>
          <p>{suggestion}</p>
          <button onClick={() => onAccept(suggestion)}>
            Use This Description
          </button>
        </div>
      )}
    </div>
  );
}
```

#### Step 3: Integrate in Gig Creation
**Modify `src/app/app/gigs/create/page.tsx`**

### Cost
- **Free** (Gemini free tier)

---

## Feature 3: Price Suggestion

### What It Does
New provider doesn't know what to charge → AI suggests fair price based on category, experience, market data.

### Implementation Steps

#### Step 1: Update AI Service
**Modify `src/lib/ai.ts`**

```typescript
export async function suggestPrice(
  category: string, 
  description: string, 
  experience?: number
) {
  const supabase = createClient(await (await import("next/headers")).cookies());
  
  const { data: similarGigs } = await supabase
    .from("gigs")
    .select("price, category")
    .eq("category", category)
    .eq("status", "approved")
    .limit(10);
  
  const avgPrice = similarGigs?.length 
    ? similarGigs.reduce((sum, g) => sum + g.price, 0) / similarGigs.length 
    : 0;
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const result = await model.generateContent(
    `You are a pricing expert for a Pakistani service marketplace.
    
    Current market average for ${category}: Rs. ${avgPrice/100}
    
    Suggest a competitive price for:
    Category: ${category}
    Description: ${description}
    Experience: ${experience || "not specified"} years
    
    Respond with just the number in PKR (e.g., "Rs. 5000")`
  );
  
  return result.response.text();
}
```

#### Step 2: Create UI Component
**New file: `src/components/price-suggestion.tsx`**

#### Step 3: Integrate in Gig Creation
Add to gig creation form alongside description generator.

### Cost
- **Free** (Gemini free tier)

---

## Feature 4: Customer Support Chatbot

### What It Does
AI answers FAQs about orders, packages, how-to. Escalates to admin when needed.

### Implementation Steps

#### Step 1: Create Knowledge Base
**New file: `src/lib/knowledge-base.ts`**

#### Step 2: Create Chat API
**New file: `src/app/api/v1/chat/route.ts`**

#### Step 3: Create Chat Widget
**New file: `src/components/support-chat.tsx`**

### Cost
- **Free** (Gemini free tier)

---

## Feature 5: Dispute Resolution Assistant

### What It Does
Admin reviews dispute → AI reads all messages, suggests resolution based on similar past cases.

### Implementation Steps

#### Step 1: Create Resolution Analyzer
**New file: `src/lib/dispute-analyzer.ts`**

#### Step 2: Add to Admin Order Detail
**Modify `src/app/admin/orders/[orderId]/page.tsx`**

### Cost
- **Free** (Gemini free tier)

---

## Implementation Order

### Phase 1: Quick Wins (Week 1)
1. **Setup Gemini API** - 30 minutes
2. **Gig Description Generator** - 2 hours
3. **Price Suggestion** - 2 hours

### Phase 2: Smart Search (Week 2-3)
4. Enable pgvector - 15 minutes
5. Create embeddings table - 30 minutes
6. Implement embedding service - 2 hours
7. Create search API - 1 hour
8. Update UI - 2 hours
9. Backfill existing gigs - 30 minutes

### Phase 3: Support (Week 4)
10. Customer support chatbot - 1 day
11. Dispute resolution assistant - 1 day

### Phase 4: Analytics (Week 5+)
12. Review summary - 4 hours
13. Market analytics - 2 days

---

## Cost Summary

| Feature | Setup Cost | Monthly Cost |
|---------|-----------|--------------|
| Gig Description Generator | $0 | $0 |
| Price Suggestion | $0 | $0 |
| Smart Search (RAG) | $0 | $0 |
| Customer Support Chatbot | $0 | $0 |
| Dispute Resolution Assistant | $0 | $0 |
| **Total** | **$0** | **$0** |

---

## Files to Create/Modify

### New Files
1. `src/lib/embeddings.ts` - Embedding generation with Gemini
2. `src/lib/knowledge-base.ts` - Chatbot knowledge
3. `src/lib/dispute-analyzer.ts` - Dispute analysis
4. `src/app/api/v1/search/route.ts` - Semantic search API
5. `src/app/api/v1/chat/route.ts` - Chat API
6. `src/components/gig-description-generator.tsx` - UI
7. `src/components/price-suggestion.tsx` - UI
8. `src/components/support-chat.tsx` - Chat widget
9. `scripts/backfill-embeddings.ts` - One-time migration

### Files to Modify
1. `src/db/schema.ts` - Add gig_embeddings table
2. `src/lib/ai.ts` - Replace OpenAI with Gemini
3. `src/components/hero-search.tsx` - Add AI search
4. `src/app/app/gigs/create/page.tsx` - Add AI tools
5. `src/app/admin/orders/[orderId]/page.tsx` - Add dispute analyzer

---

## Environment Variables

```env
# Add to .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Learning Outcomes

After implementing these, you'll understand:

1. **Embeddings** - How AI converts text to numbers for similarity search
2. **Vector Databases** - How pgvector enables semantic search
3. **RAG** - How to give AI access to your data without training
4. **Prompt Engineering** - How to structure prompts for good results
5. **AI Cost Management** - How to use AI cheaply at scale
6. **Server Actions with AI** - Patterns for AI-powered mutations
