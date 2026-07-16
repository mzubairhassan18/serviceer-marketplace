"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { trackAiCall } from "@/lib/ai-usage";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL = "gemini-2.5-flash-lite";

export async function aiChat(messages: { role: "user" | "model"; parts: string }[]) {
  return trackAiCall(MODEL, "chat", async () => {
    const model = genAI.getGenerativeModel({ model: MODEL });

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.parts }],
      })),
    });

    const lastMsg = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMsg.parts);
    return result.response.text();
  }, (text) => ({ input: text.length, output: 0 }));
}

export async function generateGigDescription(title: string, category: string) {
  return trackAiCall(MODEL, "gig_description", async () => {
    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(
      `Write a professional gig description for: "${title}" in the "${category}" category.\n\n` +
      `Requirements:\n` +
      `- Under 150 words\n` +
      `- Professional and compelling\n` +
      `- Include what the service covers\n` +
      `- Mention what makes it quality\n` +
      `- End with a call to action\n\n` +
      `Respond with just the description, no quotes or extra text.`
    );

    return result.response.text();
  }, (text) => ({ input: text.length, output: 0 }));
}

export async function suggestPrice(category: string, description: string, experience?: number) {
  const supabase = createClient(await (await import("next/headers")).cookies());

  const { data: similarGigs } = await supabase
    .from("gigs")
    .select("price, category")
    .eq("category", category)
    .eq("status", "approved")
    .limit(10);

  const avgPrice = similarGigs?.length
    ? similarGigs.reduce((sum: number, g: any) => sum + g.price, 0) / similarGigs.length
    : 0;

  return trackAiCall(MODEL, "price_suggestion", async () => {
    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(
      `You are a pricing expert for a Pakistani service marketplace.\n\n` +
      `Current market average for ${category}: Rs. ${avgPrice / 100}\n\n` +
      `Suggest a competitive price for:\n` +
      `Category: ${category}\n` +
      `Description: ${description}\n` +
      `Experience: ${experience || "not specified"} years\n\n` +
      `Respond with just the number in PKR (e.g., "Rs. 5000")`
    );

    return result.response.text();
  }, (text) => ({ input: text.length, output: 0 }));
}

export async function suggestCategory(title: string, description: string) {
  const categories = ["Plumbing", "Electrical", "Painting", "Cleaning", "Carpentry", "Security", "Construction"];

  return trackAiCall(MODEL, "category_suggestion", async () => {
    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(
      `Given these service categories: ${categories.join(", ")}\n\n` +
      `Service title: "${title}"\n` +
      `Description: "${description}"\n\n` +
      `Which single category best fits? Respond with ONLY the category name.`
    );

    return result.response.text();
  }, (text) => ({ input: text.length, output: 0 }));
}
