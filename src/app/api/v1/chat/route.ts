import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { knowledgeBase } from "@/lib/knowledge-base";
import { trackAiCall } from "@/lib/ai-usage";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL = "gemini-2.5-flash-lite";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  try {
    const response = await trackAiCall(MODEL, "chat", async () => {
      const model = genAI.getGenerativeModel({ model: MODEL });

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

      const lastMsg = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMsg.content || lastMsg.text || "");
      return result.response.text();
    }, (text) => ({ input: text.length, output: 0 }));

    return NextResponse.json({ response });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "AI request failed" }, { status: 500 });
  }
}
