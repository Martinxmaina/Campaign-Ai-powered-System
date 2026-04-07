import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Parallel fetch: alerts, analyzed posts, candidates
    const [alertsRes, postsRes, candidatesRes] = await Promise.all([
      supabase
        .from("war_room_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("analyzed_posts")
        .select("sentiment, candidates_mentioned, key_insight, analyzed_at, raw_posts(platform)")
        .order("analyzed_at", { ascending: false })
        .limit(50),
      supabase
        .from("candidates")
        .select("id, name, party, win_prob, momentum, threat_level, mention_count_7d, is_our_candidate")
        .order("win_prob", { ascending: false }),
    ]);

    type AlertRow = Record<string, string | null>;
    type PostRow = Record<string, string | null>;
    type CandidateRow = Record<string, string | number | boolean | null>;

    const alerts: AlertRow[] = alertsRes.data ?? [];
    const posts: PostRow[] = postsRes.data ?? [];
    const candidates: CandidateRow[] = candidatesRes.data ?? [];

    // Compute sentiment pulse from last 24h posts
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recent = posts.filter((p) => (p.analyzed_at ?? "") > cutoff);
    const pulse = {
      positive: recent.filter((p) => p.sentiment === "positive").length,
      negative: recent.filter((p) => p.sentiment === "negative").length,
      neutral: recent.filter((p) => p.sentiment === "neutral").length,
      total: recent.length,
    };

    // Build prompt context
    const alertSummary = alerts
      .slice(0, 10)
      .map((a) => `[${(a.severity ?? "").toUpperCase()}] ${a.description} (${a.status}, ${new Date(a.created_at ?? "").toLocaleString()})`)
      .join("\n");

    const postSummary = posts
      .slice(0, 20)
      .map((p) => {
        const platform = (p.raw_posts as Record<string, string> | null)?.platform ?? "unknown";
        const mentioned = Array.isArray(p.candidates_mentioned) ? (p.candidates_mentioned as string[]).join(", ") : "none";
        return `Platform: ${platform} | Sentiment: ${p.sentiment} | Candidates: ${mentioned} | ${p.key_insight ?? ""}`;
      })
      .join("\n");

    const candidateSummary = candidates
      .map((c) => `${c.name} (${c.party ?? "Independent"}) — Win prob: ${c.win_prob}% | Momentum: ${c.momentum} | Threat: ${c.threat_level} | 7d mentions: ${c.mention_count_7d ?? 0}`)
      .join("\n");

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
    }

    const prompt = `You are a senior war room analyst embedded in the UDA (United Democratic Alliance) campaign for the Ol Kalou parliamentary by-election in Nyandarua County, Kenya.

CAMPAIGN IDENTITY: We ARE the UDA campaign. Our mission is to elect the UDA candidate (marked is_our_candidate = true). UDA is President Ruto's party — Kenya Kwanza, bottom-up economy, hustler nation. Every threat assessment, recommendation, and action item must be framed around what wins for UDA.

Current context:
- 5 wards: Karandi, Mirangine, Gathanji, Gatimu, Rurii
- Our candidate: the UDA-affiliated candidate (is_our_candidate = true) — carries the presidential endorsement
- PRIMARY THREAT: DCP (Gachagua's party) is aggressively vote-splitting in the Mt. Kenya bloc post-impeachment. They must be neutralised.
- UDA is the ruling party with national resources and the Kenya Kwanza agenda as a campaigning asset

RECENT ALERTS (last 20):
${alertSummary || "No active alerts."}

RECENT SOCIAL MEDIA POSTS (last 20 analyzed):
${postSummary || "No recent posts."}

CANDIDATE STANDINGS:
${candidateSummary || "No candidate data."}

Produce a structured threat assessment in this EXACT markdown format:

## Executive Summary
[2-3 sentences: current situation, main risks, overall campaign health]

## Active Threats
| Severity | Threat | Source | Action Required |
|----------|--------|--------|----------------|
[list up to 5 key threats from the alerts and social data]

## Candidate Threat Matrix
| Candidate | Party | Threat Level | Momentum | Win % | Assessment |
|-----------|-------|-------------|----------|-------|------------|
[one row per candidate from the standings data]

## Recommended Actions
1. [specific action with owner — e.g., "Field team: Deploy agents to Mirangine ward..."]
2. [...]
3. [...]
4. [...]
5. [...]

## Sentiment Pulse (Last 24h)
Positive: ${pulse.positive} posts | Negative: ${pulse.negative} posts | Neutral: ${pulse.neutral} posts | Total: ${pulse.total} posts
[1 sentence interpreting the sentiment trend]

Keep all assessments specific, actionable, and data-driven. Do not add extra sections.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://votercore.app",
        "X-Title": "VoterCore War Room",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-6",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `OpenRouter error: ${err}` }, { status: 502 });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({
      analysis,
      sentiment_pulse: pulse,
      active_alerts: alerts.filter((a: AlertRow) => a.status === "active").length,
      critical_threats: alerts.filter((a: AlertRow) => a.severity === "critical" && a.status === "active").length,
      posts_analyzed_24h: pulse.total,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
