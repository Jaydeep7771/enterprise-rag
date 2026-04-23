import { NextRequest, NextResponse } from "next/server";
import { searchChunks, getChunkCount } from "@/lib/document-store";

/**
 * POST /api/chat
 *
 * RAG pipeline:
 * 1. Search in-memory document store with keyword matching
 * 2a. If GOOGLE_API_KEY is set → call Google Gemini with retrieved context
 * 2b. Otherwise → return a context-grounded fallback response
 */

const SYSTEM_PROMPT = `You are an intelligent enterprise document assistant.
You answer questions based ONLY on the provided document context.
If the context doesn't contain enough information to answer, say so clearly.
Always be precise, professional, and cite the relevant section when helpful.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body as { 
      message: string; 
      conversationHistory?: { role: string; content: string }[] 
    };

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const totalChunks = getChunkCount();

    // ── 1. Retrieve relevant chunks via keyword search ──────────────────────
    const relevantChunks = searchChunks(message, 5);

    const sources = relevantChunks.map((chunk, idx) => ({
      id: chunk.id,
      content: chunk.content,
      metadata: {
        filename: chunk.filename,
        chunkIndex: chunk.chunkIndex,
      },
      // Normalised similarity score (rank-based: best = 1.0, worst shown = 0.6)
      similarity: parseFloat((1.0 - (idx * 0.08)).toFixed(2)),
    }));

    const hasApiKey =
      process.env.GOOGLE_API_KEY &&
      process.env.GOOGLE_API_KEY !== "your-gemini-api-key";

    // ── 2a. LIVE MODE — call Google Gemini ──────────────────────────────────
    if (hasApiKey) {
      try {
        const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
        const { HumanMessage, SystemMessage, AIMessage } = await import("@langchain/core/messages");

        const llm = new ChatGoogleGenerativeAI({
          model: "gemini-2.5-flash",
          apiKey: process.env.GOOGLE_API_KEY!,
          temperature: 0.3,
          maxOutputTokens: 4096,
        });

        const contextBlock =
          relevantChunks.length > 0
            ? relevantChunks
              .map(
                (c, i) =>
                  `[Source ${i + 1} — ${c.filename} chunk #${c.chunkIndex}]\n${c.content}`
              )
              .join("\n\n---\n\n")
            : "No relevant document context found for this query.";

        const userPrompt = `Document Context:\n\n${contextBlock}\n\n---\n\nUser Question: ${message}`;

        // Map past history into Langchain message objects (limit to last 10 messages for context window)
        const historyMessages = conversationHistory.slice(-10).map((msg) => {
          if (msg.role === "assistant") {
            return new AIMessage(msg.content);
          }
          return new HumanMessage(msg.content);
        });

        const response = await llm.invoke([
          new SystemMessage(SYSTEM_PROMPT),
          ...historyMessages,
          new HumanMessage(userPrompt),
        ]);

        const content =
          typeof response.content === "string"
            ? response.content
            : JSON.stringify(response.content);

        return NextResponse.json({
          success: true,
          mode: "live",
          response: {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content,
            timestamp: new Date().toISOString(),
            sources,
          },
        });
      } catch (aiError) {
        console.error("Gemini call failed:", aiError);
        // Fall through to fallback below
      }
    }

    // ── 2b. FALLBACK MODE — keyword search response ─────────────────────────
    let fallbackContent: string;

    if (totalChunks === 0) {
      fallbackContent =
        "**No documents have been uploaded yet.**\n\nPlease upload a PDF or text file using the sidebar, then ask your question.";
    } else if (relevantChunks.length === 0) {
      fallbackContent =
        `**No relevant content found** for your query in the ${totalChunks} indexed chunk${totalChunks !== 1 ? "s" : ""}.\n\nTry rephrasing your question or check that the document covers this topic.`;
    } else {
      const excerpts = relevantChunks
        .slice(0, 3)
        .map(
          (c, i) =>
            `**[${i + 1}] ${c.filename}** (chunk #${c.chunkIndex})\n> ${c.content.slice(0, 280).replace(/\n/g, " ")}${c.content.length > 280 ? "…" : ""}`
        )
        .join("\n\n");

      const modeNote = hasApiKey
        ? "\n\n*⚠ Gemini call failed — showing keyword-matched excerpts instead.*"
        : "\n\n*ℹ Set a valid `GOOGLE_API_KEY` in `.env.local` to enable AI-generated answers.*";

      fallbackContent = `Here are the most relevant passages I found for **"${message}"**:\n\n${excerpts}${modeNote}`;
    }

    return NextResponse.json({
      success: true,
      mode: "fallback",
      response: {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: fallbackContent,
        timestamp: new Date().toISOString(),
        sources,
      },
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Internal server error during chat processing." },
      { status: 500 }
    );
  }
}
