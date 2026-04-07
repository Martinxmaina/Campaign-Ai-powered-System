import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { claudeComplete } from "@/lib/ai/claude";
import { requireAuth } from "@/utils/supabase/api-auth";

export async function POST(req: NextRequest) {
  const { auth, response } = await requireAuth(req);
  if (!auth) return response;
  try {
    const supabase = createAdminClient();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const dateStr = new Date().toISOString().slice(0, 10);

    const [{ data: candidates }, { data: alerts }, { data: fieldReports }, { data: posts }] = await Promise.all([
      supabase.from("candidates").select("name, win_prob, momentum, sentiment_positive, mention_count_7d").order("win_prob", { ascending: false }),
      supabase.from("war_room_alerts").select("severity, description, status").gte("created_at", yesterday).order("created_at", { ascending: false }),
      supabase.from("field_reports").select("ward, report_type, mood_score, notes").gte("created_at", yesterday),
      supabase.from("analyzed_posts").select("sentiment, key_insight").gte("analyzed_at", yesterday).limit(100),
    ]);

    const totalPosts = posts?.length ?? 0;
    const positivePosts = posts?.filter((p) => p.sentiment === "positive").length ?? 0;
    const negativePosts = posts?.filter((p) => p.sentiment === "negative").length ?? 0;

    const briefingContext = `
Date: ${dateStr}
Constituency: Ol Kalou

## Candidate Standings
${(candidates ?? []).map((c) => `- ${c.name}: ${c.win_prob}% win prob, ${c.momentum} momentum, ${c.mention_count_7d} mentions (7d), ${c.sentiment_positive}% positive sentiment`).join("\n")}

## War Room Alerts (last 24h): ${alerts?.length ?? 0} total
${(alerts ?? []).slice(0, 10).map((a) => `- [${a.severity}/${a.status}] ${a.description}`).join("\n")}

## Sentiment (last 24h): ${totalPosts} posts analyzed
- Positive: ${positivePosts} (${totalPosts ? Math.round(positivePosts / totalPosts * 100) : 0}%)
- Negative: ${negativePosts} (${totalPosts ? Math.round(negativePosts / totalPosts * 100) : 0}%)
- Neutral: ${totalPosts - positivePosts - negativePosts}

## Key Insights from Social Media
${(posts ?? []).slice(0, 15).filter((p) => p.key_insight).map((p) => `- ${p.key_insight}`).join("\n")}

## Field Reports (last 24h): ${fieldReports?.length ?? 0} reports
${(fieldReports ?? []).slice(0, 10).map((r) => `- [${r.ward}] ${r.report_type} | Mood: ${r.mood_score}/5${r.notes ? " — " + r.notes.slice(0, 100) : ""}`).join("\n")}
    `.trim();

    const report = await claudeComplete(
      `You are a political intelligence analyst. Generate a concise presidential daily briefing in markdown format.
Include: Executive Summary, Candidate Standings, Threat Assessment, Key Voter Issues, Ground Intelligence, Recommended Actions.
Use headers, bullets, and bold for key metrics. Be direct and actionable.`,
      [{ role: "user", content: `Generate the VoterCore Presidential Intelligence Briefing for ${dateStr}:\n\n${briefingContext}` }],
      3000
    );

    return NextResponse.json({ report, date: dateStr, filename: `votercore_briefing_${dateStr}.md` });
  } catch (err) {
    console.error("/api/report error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
