import { NextRequest, NextResponse } from "next/server";
import { ragSynthesize, DEFAULT_MODEL } from "@/lib/ai/claude";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAuth } from "@/utils/supabase/api-auth";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | null;
}

export async function POST(req: NextRequest) {
  const { auth, response } = await requireAuth(req);
  if (!auth) return response;

  try {
    const { messages, model } = (await req.json()) as { messages: ChatMessage[]; model?: string };
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser?.content) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    const query = lastUser.content;
    const supabase = createAdminClient();
    const contextParts: string[] = [];

    // 1. Vector search (if embeddings exist)
    try {
      const queryEmbedding = await generateEmbedding(query);
      const { data: vectorResults } = await supabase.rpc("match_analyzed_posts", {
        query_embedding: queryEmbedding as unknown as string,
        match_threshold: 0.5,
        match_count: 8,
      });
      if (vectorResults?.length) {
        contextParts.push("## Relevant Social Intelligence");
        for (const r of vectorResults) {
          contextParts.push(`- [${r.sentiment}] ${r.key_insight || r.translation || ""} | Candidates: ${(r.candidates_mentioned ?? []).join(", ") || "none"}`);
        }
      }
    } catch {
      // Embeddings not available yet — skip vector search
    }

    // 2. Latest candidate standings
    const { data: candidates } = await supabase
      .from("candidates")
      .select("name, win_prob, momentum, sentiment_positive, mention_count_7d")
      .order("win_prob", { ascending: false });
    if (candidates?.length) {
      contextParts.push("\n## Current Candidate Standings");
      for (const c of candidates) {
        contextParts.push(`- ${c.name}: ${c.win_prob}% win probability, ${c.momentum} momentum, ${c.mention_count_7d} mentions (7d)`);
      }
    }

    // 3. Active war room alerts
    const { data: alerts } = await supabase
      .from("war_room_alerts")
      .select("severity, description, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5);
    if (alerts?.length) {
      contextParts.push("\n## Active War Room Alerts");
      for (const a of alerts) {
        contextParts.push(`- [${a.severity}] ${a.description}`);
      }
    }

    // 4. Recent field reports (ward, notes, report_type)
    try {
      const { data: fieldReports } = await supabase
        .from("field_reports")
        .select("ward, notes, report_type, mood_score, priority, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (fieldReports?.length) {
        contextParts.push("\n## Recent Field Reports (Ground Intelligence)");
        for (const r of fieldReports) {
          if (r.notes) {
            const mood = r.mood_score != null ? ` mood:${r.mood_score}/10` : "";
            contextParts.push(`- [${r.ward}] ${r.notes} (${r.report_type}${mood})`);
          }
        }
      }
    } catch { /* skip if unavailable */ }

    // 5. Voter contact counts by ward
    try {
      const { data: voterRows } = await supabase
        .from("voter_contacts")
        .select("ward")
        .not("ward", "is", null)
        .limit(2000);
      if (voterRows?.length) {
        const wardMap = new Map<string, number>();
        for (const v of voterRows) {
          if (v.ward) wardMap.set(v.ward, (wardMap.get(v.ward) ?? 0) + 1);
        }
        const total = voterRows.length;
        contextParts.push(`\n## Voter Contact Database\nTotal contacts: ${total.toLocaleString()}`);
        const topWards = [...wardMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
        for (const [ward, count] of topWards) {
          contextParts.push(`- ${ward}: ${count} contacts`);
        }
      }
    } catch { /* skip if unavailable */ }

    // 6. Upcoming campaign events
    try {
      const { data: events } = await supabase
        .from("events")
        .select("title, location, event_date, ward")
        .gte("event_date", new Date().toISOString())
        .order("event_date")
        .limit(5);
      if (events?.length) {
        contextParts.push("\n## Upcoming Campaign Events");
        for (const e of events) {
          const date = e.event_date ? new Date(e.event_date).toLocaleDateString("en-KE", { dateStyle: "medium" }) : "TBD";
          contextParts.push(`- [${date}] ${e.title ?? "Event"}${e.location ? ` @ ${e.location}` : ""}${e.ward ? ` (${e.ward})` : ""}`);
        }
      }
    } catch { /* skip if unavailable */ }

    const context = contextParts.length
      ? contextParts.join("\n")
      : "No data in database yet. Posts will appear once the ingestion pipeline is running.";

    const answer = await ragSynthesize(query, context, model ?? DEFAULT_MODEL);

    // Stream the answer as SSE (word by word for natural feel)
    const encoder = new TextEncoder();
    const words = answer.split(" ");
    const stream = new ReadableStream({
      start(controller) {
        let i = 0;
        function push() {
          if (i >= words.length) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
            controller.close();
            return;
          }
          const chunk = (i === 0 ? "" : " ") + words[i++];
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "content", text: chunk })}\n\n`));
          setTimeout(push, 15);
        }
        push();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
