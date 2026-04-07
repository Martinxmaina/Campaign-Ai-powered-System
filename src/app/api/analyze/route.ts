import { NextRequest, NextResponse } from "next/server";
import { analyzePosts } from "@/lib/ai/claude";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAuth } from "@/utils/supabase/api-auth";

export async function POST(req: NextRequest) {
  const { auth, response } = await requireAuth(req);
  if (!auth) return response;

  try {
    const { posts } = await req.json() as {
      posts: { id: string; platform: string; content: string; author?: string }[]
    };

    if (!posts?.length) {
      return NextResponse.json({ error: "No posts provided" }, { status: 400 });
    }

    const { data: candidates } = await supabase
      .from("candidates")
      .select("name, party, aliases, is_our_candidate")
      .order("win_prob", { ascending: false });

    const results = await analyzePosts(posts, candidates ?? []);
    const supabase = createAdminClient();
    let processed = 0, errors = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const postId = posts[i]?.id;
      if (!postId) { errors++; continue; }

      try {
        await supabase.from("analyzed_posts").upsert({
          id: postId,
          language: result.language as string ?? null,
          translation: result.translation as string ?? null,
          sentiment: result.sentiment as string ?? null,
          sentiment_score: result.sentiment_score as number ?? null,
          intent: result.intent as string ?? null,
          candidates_mentioned: result.candidates_mentioned as string[] ?? [],
          parties_mentioned: result.parties_mentioned as string[] ?? [],
          issues: result.issues as string[] ?? [],
          key_insight: result.key_insight as string ?? null,
          relevance_score: result.relevance_score as number ?? null,
          is_bot_suspected: result.is_bot_suspected as boolean ?? false,
        });
        processed++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({ processed, errors, results });
  } catch (err) {
    console.error("/api/analyze error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
