/**
 * In-memory document store.
 * Persists for the lifetime of the Node.js server process.
 * Chunks are added by /api/ingest and searched by /api/chat.
 */

export interface StoredChunk {
  id: string;
  content: string;
  filename: string;
  chunkIndex: number;
}

// Use a global to survive Next.js hot-reloads in dev
const globalStore = global as typeof global & {
  __docStore?: StoredChunk[];
};

if (!globalStore.__docStore) {
  globalStore.__docStore = [];
}

const store = globalStore.__docStore;

export function addChunks(chunks: StoredChunk[]): void {
  store.push(...chunks);
}

export function clearDocument(filename: string): void {
  const idx = store.findIndex((c) => c.filename === filename);
  while (idx !== -1) {
    store.splice(idx, 1);
  }
  // Filter approach (safer):
  const toRemove = store.filter((c) => c.filename === filename);
  toRemove.forEach((c) => {
    const i = store.indexOf(c);
    if (i !== -1) store.splice(i, 1);
  });
}

export function clearAll(): void {
  store.splice(0, store.length);
}

export function getChunkCount(): number {
  return store.length;
}

/**
 * Simple keyword-based relevance search.
 * Scores each chunk by how many query terms appear in it.
 * Returns top-k chunks sorted by score descending.
 */
export function searchChunks(query: string, topK = 5): StoredChunk[] {
  if (store.length === 0) return [];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2); // ignore very short words

  if (terms.length === 0) {
    // Return first topK chunks as fallback
    return store.slice(0, topK);
  }

  const scored = store.map((chunk) => {
    const text = chunk.content.toLowerCase();
    let score = 0;
    for (const term of terms) {
      // Count occurrences of each term (TF-style)
      const matches = (text.match(new RegExp(term, "g")) || []).length;
      score += matches;
    }
    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk);
}
