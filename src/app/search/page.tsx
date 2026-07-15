import { redirect } from "next/navigation";

export default async function SearchPage(props: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q, category } = await props.searchParams;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const qs = params.toString();
  redirect(`/${qs ? `?${qs}` : ""}`);
}
