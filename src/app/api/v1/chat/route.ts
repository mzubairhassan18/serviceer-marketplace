import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { knowledgeBase } from "@/lib/knowledge-base";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{
          text:
            `You are a helpful customer support assistant for Serviceer marketplace.\n\n` +
            `Knowledge base:\n${knowledgeBase}\n\n` +
            `Rules:\n` +
            `- Answer questions about orders, packages, and how the platform works\n` +
            `- If you don't know the answer, say "Let me connect you with our support team"\n` +
            `- Never make up information\n` +
            `- Be concise and helpful\n` +
            `- Respond in the same language the user uses`,
        }],
      },
      {
        role: "model",
        parts: [{ text: "I understand. I'm ready to help users with questions about Serviceer marketplace." }],
      },
    ],
  });

  try {
    const lastMsg = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMsg.content || lastMsg.text || "");
    return NextResponse.json({ response: result.response.text() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "AI request failed" }, { status: 500 });
  }
}
