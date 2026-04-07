// Embeddings via OpenRouter (uses OPENAI_API_KEY as OpenRouter key)

const OPENROUTER_EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings";
const EMBED_MODEL = "openai/text-embedding-3-small";

function getHeaders() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "HTTP-Referer": "https://votercore.app",
    "X-Title": "VoterCore",
  };
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const res = await fetch(OPENROUTER_EMBEDDINGS_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter Embeddings error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return (data.data as { embedding: number[] }[]).map((d) => d.embedding);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const results = await generateEmbeddings([text]);
  return results[0];
}
