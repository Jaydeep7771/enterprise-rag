export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    filename: string;
    page?: number;
    chunkIndex: number;
  };
  similarity?: number;
}

export interface UploadedDocument {
  id: string;
  filename: string;
  size: number;
  chunksCount: number;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
}
