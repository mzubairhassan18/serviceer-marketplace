import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
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
    embedding: JSON.stringify(embedding),
  });
}

export async function findSimilarGigs(queryEmbedding: number[], limit = 10) {
  const supabase = createClient(await (await import("next/headers")).cookies());

  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const { data, error } = await supabase.rpc("match_gigs", {
    query_embedding: embeddingStr,
    match_count: limit,
  });

  if (error) throw error;
  return data;
}
