import { NextRequest, NextResponse } from "next/server";
import { generateEmbeddings } from "@/lib/ai/embeddings";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAuth } from "@/utils/supabase/api-auth";

export async function POST(req: NextRequest) {
  const { auth, response } = await requireAuth(req);
  if (!auth) return response;

  try {
    const { post_ids } = await req.json() as { post_ids: string[] };
    if (!post_ids?.length) {
      return NextResponse.json({ error: "No post_ids provided" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch content to embed
    const { data: posts, error } = await supabase
      .from("analyzed_posts")
      .select("id, key_insight, translation")
      .in("id", post_ids);

    if (error) throw error;
    if (!posts?.length) return NextResponse.json({ embedded: 0, errors: 0 });

    const texts = posts.map((p) => p.translation || p.key_insight || "").filter(Boolean);
    const ids = posts.filter((p) => p.translation || p.key_insight).map((p) => p.id);

    if (!texts.length) return NextResponse.json({ embedded: 0, errors: posts.length });

    const embeddings = await generateEmbeddings(texts);
    let embedded = 0, errors = 0;

    for (let i = 0; i < ids.length; i++) {
      try {
        // Store embedding as JSON string — Supabase JS client handles vector type
        await supabase.from("analyzed_posts").update({
          embedding: JSON.stringify(embeddings[i]) as unknown as string,
        }).eq("id", ids[i]);
        embedded++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({ embedded, errors });
  } catch (err) {
    console.error("/api/embed error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
