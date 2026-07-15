import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price")) || 0;
  const tagsRaw = (formData.get("tags") as string) || "";
  const location = (formData.get("location") as string) || "";
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  const { data: gig, error } = await supabase
    .from("gigs")
    .insert({
      provider_id: user.id,
      title,
      category,
      description,
      price: price * 100,
      tags,
      location,
      status: "pending",
      currency: "PKR",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ gig }, { status: 201 });
}
