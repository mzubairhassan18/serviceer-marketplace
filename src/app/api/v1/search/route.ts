import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const tag = searchParams.get("tag") || "";

  const supabase = createClient(await cookies());
  let query = supabase.from("gigs").select("*, profiles!provider_id(name)").eq("status", "approved");

  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);
  if (q) query = query.textSearch("title", q, { config: "english" });

  const { data: gigs, error } = await query.order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ gigs });
}
