import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const tag = searchParams.get("tag") || "";
  const semantic = searchParams.get("semantic") === "1";

  const supabase = createClient(await cookies());

  // Semantic search via embeddings
  if (semantic && q.trim()) {
    try {
      const queryEmbedding = await generateEmbedding(q);
      const embeddingStr = `[${queryEmbedding.join(",")}]`;

      const { data, error } = await supabase.rpc("search_gigs_by_embedding", {
        query_embedding: embeddingStr,
        match_count: 20,
      });

      if (error) throw error;

      return NextResponse.json({
        gigs: data?.map((r: any) => ({
          id: r.gig_id,
          title: r.title,
          description: r.description,
          category: r.category,
          price: r.price,
          provider_name: r.provider_name,
          similarity: r.similarity,
        })) || [],
        mode: "semantic",
      });
    } catch (err) {
      // Fall through to keyword search if embeddings not set up
    }
  }

  // Keyword search (existing)
  let query = supabase
    .from("gigs")
    .select("*, profiles!provider_id(name)")
    .eq("status", "approved");

  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);
  if (q) query = query.textSearch("title", q, { config: "english" });

  const { data: gigs, error } = await query.order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ gigs, mode: "keyword" });
}
