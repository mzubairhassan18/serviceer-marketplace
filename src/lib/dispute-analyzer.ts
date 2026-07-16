import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeDispute(orderId: string) {
  const supabase = createClient(await (await import("next/headers")).cookies());

  const { data: order } = await supabase
    .from("orders")
    .select("*, gigs(title), profiles!buyer_id(name), profiles!provider_id(name)")
    .eq("id", orderId)
    .single();

  if (!order) throw new Error("Order not found");

  const { data: messages } = await supabase
    .from("messages")
    .select("body, created_at, profiles!sender_id(name, role)")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  const { data: pastDisputes } = await supabase
    .from("orders")
    .select("dispute_reason, status")
    .eq("status", "dispute_resolved")
    .limit(20);

  const messagesText = messages
    ?.map((m: any) => `${m.profiles?.name ?? "Unknown"} (${m.profiles?.role ?? "user"}): ${m.body}`)
    .join("\n") || "No messages found.";

  const pastContext = pastDisputes
    ?.map((d: any) => `- "${d.dispute_reason}" → resolved as ${d.status}`)
    .join("\n") || "No past resolved disputes.";

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(
    `You are a dispute resolution assistant for a Pakistani service marketplace.\n\n` +
    `Analyze this dispute and suggest a fair resolution.\n\n` +
    `## Order Info\n` +
    `Service: ${(order as any).gigs?.title ?? "Unknown"}\n` +
    `Buyer: ${(order as any).profiles?.name ?? "Unknown"}\n` +
    `Provider: ${(order as any).profiles?.name ?? "Unknown"}\n` +
    `Dispute reason: ${order.dispute_reason ?? "Not specified"}\n\n` +
    `## Conversation\n` +
    `${messagesText}\n\n` +
    `## Past Resolved Disputes (for reference)\n` +
    `${pastContext}\n\n` +
    `## Your Task\n` +
    `Provide:\n` +
    `1. **Summary**: Brief summary of the issue\n` +
    `2. **Fault**: Who is at fault (buyer/provider/both/neither)\n` +
    `3. **Suggested Resolution**: What should happen\n` +
    `4. **Confidence**: low/medium/high\n\n` +
    `Be fair and concise.`
  );

  return result.response.text();
}
