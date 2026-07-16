"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function aiChat(messages: { role: "user" | "assistant" | "system"; content: string }[]) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 1000,
  });
  return response.choices[0].message.content;
}

export async function generateGigDescription(title: string, category: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant that writes professional service descriptions for a marketplace. Keep it concise, professional, and compelling. Under 150 words." },
      { role: "user", content: `Write a gig description for: "${title}" in the "${category}" category. Include what the service covers, what makes it quality, and a call to action.` },
    ],
    max_tokens: 300,
  });
  return response.choices[0].message.content;
}

export async function suggestPrice(category: string, description: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a pricing expert for a Pakistani service marketplace. Suggest a price range in PKR. Be realistic for the local market. Respond with just the suggested price as a number (in PKR, not paisa)." },
      { role: "user", content: `Suggest a fair price for this service:\nCategory: ${category}\nDescription: ${description}` },
    ],
    max_tokens: 50,
  });
  return response.choices[0].message.content;
}
