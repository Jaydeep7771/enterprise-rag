import { NextRequest, NextResponse } from "next/server";
import { addChunks } from "@/lib/document-store";

/**
 * POST /api/ingest
 * Receives uploaded files (PDF or text), extracts text, splits into chunks,
 * and stores them in the in-memory document store for RAG retrieval.
 */

function splitTextIntoChunks(
  text: string,
  chunkSize = 1000,
  chunkOverlap = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) chunks.push(chunk); // skip tiny fragments
    start += chunkSize - chunkOverlap;
  }
  return chunks;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please upload a PDF or text file." },
        { status: 400 }
      );
    }

    const isPDF =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isText =
      file.type === "text/plain" ||
      file.type === "text/markdown" ||
      file.name.toLowerCase().endsWith(".txt") ||
      file.name.toLowerCase().endsWith(".md");

    if (!isPDF && !isText) {
      return NextResponse.json(
        { error: `Unsupported file type: "${file.type}". Please upload a PDF or text file.` },
        { status: 400 }
      );
    }

    let extractedText = "";

    if (isPDF) {
      try {
        // pdf-parse v1.1.4 does not have the index.js side-effect bug,
        // so we can use standard require() directly. Next.js serverExternalPackages
        // will handle this correctly.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse") as (
          buffer: Buffer,
          options?: Record<string, unknown>
        ) => Promise<{ text: string; numpages: number }>;
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (pdfError: any) {
        console.error("PDF parsing error details:", pdfError);
        return NextResponse.json(
          { 
            error: "Failed to parse PDF. The file may be corrupted or encrypted.", 
            details: pdfError?.message || String(pdfError) 
          },
          { status: 422 }
        );
      }
    } else {
      extractedText = await file.text();
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "No text content could be extracted from the file." },
        { status: 422 }
      );
    }

    const rawChunks = splitTextIntoChunks(extractedText);

    // Store chunks in the in-memory document store so /api/chat can retrieve them
    const storedChunks = rawChunks.map((content, index) => ({
      id: `${file.name}-chunk-${index}`,
      content,
      filename: file.name,
      chunkIndex: index,
    }));
    addChunks(storedChunks);

    const hasApiKey =
      process.env.GOOGLE_API_KEY &&
      process.env.GOOGLE_API_KEY !== "your-gemini-api-key";

    return NextResponse.json({
      success: true,
      mode: hasApiKey ? "live" : "ui-development",
      message: hasApiKey
        ? "Document processed and stored. Ready for AI-powered chat."
        : "Document processed and stored in memory. Chat will use keyword search until GOOGLE_API_KEY is configured.",
      document: {
        filename: file.name,
        size: file.size,
        totalChunks: storedChunks.length,
        textPreview: extractedText.slice(0, 300) + "...",
      },
    });
  } catch (error) {
    console.error("Ingest route error:", error);
    return NextResponse.json(
      { error: "Internal server error during document ingestion." },
      { status: 500 }
    );
  }
}
