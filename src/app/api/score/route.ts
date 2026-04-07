import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAuth } from "@/utils/supabase/api-auth";

export async function POST(req: NextRequest) {
  const { auth, response } = await requireAuth(req);
  if (!auth) return response;

  try {
    const supabase = createAdminClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [{ data: candidates }, { data: posts }, { data: fieldReports }] = await Promise.all([
      supabase.from("candidates").select("id, name, win_prob"),
      supabase.from("analyzed_posts").select("candidates_mentioned, sentiment").gte("analyzed_at", sevenDaysAgo),
      supabase.from("field_reports").select("candidate_id, mood_score").gte("created_at", sevenDaysAgo).not("mood_score", "is", null),
    ]);

    if (!candidates?.length) return NextResponse.json({ scores: [] });

    // Tally mentions and sentiment
    const mentions: Record<string, number> = {};
    const positives: Record<string, number> = {};
    let totalMentions = 0;

    for (const post of posts ?? []) {
      for (const name of post.candidates_mentioned ?? []) {
        mentions[name] = (mentions[name] ?? 0) + 1;
        totalMentions++;
        if (post.sentiment === "positive") positives[name] = (positives[name] ?? 0) + 1;
      }
    }

    // Ground mood averages
    const moodSums: Record<string, number> = {};
    const moodCounts: Record<string, number> = {};
    for (const r of fieldReports ?? []) {
      if (!r.candidate_id || !r.mood_score) continue;
      moodSums[r.candidate_id] = (moodSums[r.candidate_id] ?? 0) + r.mood_score;
      moodCounts[r.candidate_id] = (moodCounts[r.candidate_id] ?? 0) + 1;
    }

    // Raw scores
    const rawScores: Record<string, number> = {};
    for (const c of candidates) {
      const sentShare = mentions[c.name] ? (positives[c.name] ?? 0) / mentions[c.name] * 100 : 0;
      const mentionShare = totalMentions ? (mentions[c.name] ?? 0) / totalMentions * 100 : 0;
      const moodAvg = moodCounts[c.id] ? moodSums[c.id] / moodCounts[c.id] : 2.5;
      const groundScore = (moodAvg - 1) / 4 * 100;
      rawScores[c.id] = sentShare * 0.30 + mentionShare * 0.25 + groundScore * 0.20 + 50 * 0.25;
    }

    const totalRaw = Object.values(rawScores).reduce((a, b) => a + b, 0);
    const scores = [];

    for (const c of candidates) {
      const winProb = totalRaw > 0 ? Math.round(rawScores[c.id] / totalRaw * 100 * 100) / 100 : 0;
      const prevProb = c.win_prob ?? 0;
      const momentum = winProb > prevProb + 2 ? "rising" : winProb < prevProb - 2 ? "declining" : "stable";
      const sentPositive = mentions[c.name] ? Math.round((positives[c.name] ?? 0) / mentions[c.name] * 100 * 100) / 100 : 0;
      const mentionCount = mentions[c.name] ?? 0;

      await supabase.from("candidates").update({
        win_prob: winProb,
        sentiment_positive: sentPositive,
        mention_count_7d: mentionCount,
        momentum,
        share_of_voice: totalMentions ? Math.round(mentionCount / totalMentions * 100 * 100) / 100 : 0,
      }).eq("id", c.id);

      await supabase.from("candidates_history").insert({
        candidate_id: c.id,
        win_prob: winProb,
        sentiment_positive: sentPositive,
        mention_count: mentionCount,
      });

      scores.push({ candidate_id: c.id, name: c.name, win_prob: winProb, momentum });
    }

    return NextResponse.json({ scores });
  } catch (err) {
    console.error("/api/score error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
