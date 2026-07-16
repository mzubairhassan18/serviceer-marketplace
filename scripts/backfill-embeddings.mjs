import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

async function generateEmbedding(text) {
  const res = await fetch(`${EMBEDDING_URL}?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/text-embedding-004",
      content: { parts: [{ text }] },
    }),
  });

  if (!res.ok) throw new Error(`Embedding API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.embedding.values;
}

async function backfill() {
  console.log("Starting gig embedding backfill...");

  const { data: gigs, error } = await supabase
    .from("gigs")
    .select("id, title, description, category, tags")
    .eq("status", "approved");

  if (error) throw error;
  if (!gigs || gigs.length === 0) {
    console.log("No approved gigs found.");
    return;
  }

  console.log(`Found ${gigs.length} approved gigs. Generating embeddings...`);

  let success = 0;
  let failed = 0;

  for (const gig of gigs) {
    try {
      const text = `${gig.title} ${gig.description} ${gig.category} ${(gig.tags || []).join(" ")}`;
      const embedding = await generateEmbedding(text);

      const { error: upsertErr } = await supabase.from("gig_embeddings").upsert(
        { gig_id: gig.id, embedding: JSON.stringify(embedding) },
        { onConflict: "gig_id" }
      );

      if (upsertErr) throw upsertErr;
      success++;
      console.log(`  OK ${gig.title}`);
    } catch (err) {
      failed++;
      console.error(`  FAIL ${gig.title}: ${err.message}`);
    }
  }

  console.log(`\nDone. ${success} embedded, ${failed} failed.`);
}

backfill().catch(console.error);
