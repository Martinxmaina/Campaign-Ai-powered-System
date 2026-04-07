import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAuth } from "@/utils/supabase/api-auth";

export async function POST(req: NextRequest) {
  const { auth, response } = await requireAuth(req);
  if (!auth) return response;

  try {
    const supabase = createAdminClient();
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const { data: candidates } = await supabase.from("candidates").select("id, name");
    if (!candidates?.length) return NextResponse.json({ alerts_created: 0 });

    const [{ data: recentPosts }, { data: priorPosts }, { data: dailyPosts }, { data: botPosts }] = await Promise.all([
      supabase.from("analyzed_posts").select("candidates_mentioned, sentiment").gte("analyzed_at", twoHoursAgo),
      supabase.from("analyzed_posts").select("candidates_mentioned, sentiment").gte("analyzed_at", fourHoursAgo).lt("analyzed_at", twoHoursAgo),
      supabase.from("analyzed_posts").select("candidates_mentioned").gte("analyzed_at", oneDayAgo).lt("analyzed_at", twoHoursAgo),
      supabase.from("analyzed_posts").select("id").eq("is_bot_suspected", true).gte("analyzed_at", twoHoursAgo),
    ]);

    const alertsCreated: object[] = [];

    for (const candidate of candidates) {
      const { name, id } = candidate;

      // Sentiment drop > 15% in 2h
      const recent = (recentPosts ?? []).filter((p) => p.candidates_mentioned?.includes(name));
      const prior = (priorPosts ?? []).filter((p) => p.candidates_mentioned?.includes(name));
      const recentPos = recent.filter((p) => p.sentiment === "positive").length;
      const priorPos = prior.filter((p) => p.sentiment === "positive").length;
      const recentPct = recent.length ? recentPos / recent.length * 100 : null;
      const priorPct = prior.length ? priorPos / prior.length * 100 : null;

      if (recentPct !== null && priorPct !== null && priorPct - recentPct > 15) {
        const alert = { severity: "high", source: "sentiment_analysis", description: `Sentiment drop for ${name}: ${priorPct.toFixed(0)}% → ${recentPct.toFixed(0)}% positive in last 2h`, status: "active", region: "Ol Kalou", candidate_id: id };
        await supabase.from("war_room_alerts").insert(alert);
        alertsCreated.push(alert);
      }

      // Mention spike > 3x baseline
      const daily = (dailyPosts ?? []).filter((p) => p.candidates_mentioned?.includes(name));
      const dailyAvgPer2h = daily.length / 11;
      if (dailyAvgPer2h > 0 && recent.length > dailyAvgPer2h * 3) {
        const alert = { severity: "medium", source: "mention_spike", description: `Mention spike for ${name}: ${recent.length} mentions in 2h (baseline: ${dailyAvgPer2h.toFixed(0)}/2h)`, status: "active", region: "Ol Kalou", candidate_id: id };
        await supabase.from("war_room_alerts").insert(alert);
        alertsCreated.push(alert);
      }
    }

    // Bot cluster
    if ((botPosts?.length ?? 0) >= 5) {
      const alert = { severity: "critical", source: "bot_detection", description: `Potential bot cluster: ${botPosts!.length} suspected bot posts in last 2h`, status: "active", region: "Ol Kalou" };
      await supabase.from("war_room_alerts").insert(alert);
      alertsCreated.push(alert);
    }

    return NextResponse.json({ alerts_created: alertsCreated.length, alerts: alertsCreated });
  } catch (err) {
    console.error("/api/detect-alerts error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
