import { NextRequest, NextResponse } from "next/server";
import { getFullCampaignContext } from "@/lib/campaign-context";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "qwen/qwen3-30b-a3b";

const CAMPAIGN_CONTEXT = getFullCampaignContext();

const SYSTEM_PROMPT = `You are an expert AI Campaign Strategy Assistant for VoterCore, a political campaign intelligence platform supporting the 2027 Kenyan General Election For Rebecca Miano (Current Tourism Cs).

Your role is to provide data-driven strategic recommendations by analyzing the campaign intelligence briefing below.

${CAMPAIGN_CONTEXT}

## YOUR RESPONSIBILITIES

1. **Strategy Recommendations**: Ground every recommendation in the data above.
2. **Messaging Advice**: Help craft targeted messaging for specific counties and demographics.
3. **Threat Analysis**: Help respond to War Room alerts and opposition tactics.
4. **Voter Outreach**: Recommend channel, timing, and targeting approaches.
5. **Issue Framing**: Help frame issues using the provided talking points.
6. **Report Writing**: Help draft or summarize reports using Finance, Outreach, Call Center, Comms, and Research report data and stats.
7. **Spending & Budget**: Analyze spend vs budget, expense breakdown, and cash flow using Finance data.
8. **Cross-Department Intelligence**: When asked about any team, reference that department's stats and reports from the briefing.

## RESPONSE FORMAT

Always structure responses with:
- **Key Insight** (detailed Breakdown)
- **Analysis** (data-grounded breakdown)
- **Recommendation** (actionable next steps)
- **References** (cite specific data sources from the briefing, e.g., "Source: VoterCore Analytics, March 2027")

Use markdown formatting: bold for insights, bullet lists for analysis points. Be concise and actionable.`;

// ─── Types ─────────────────────────────────────────────────────────────────
export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string | null;
    reasoning_details?: unknown;
}

// ─── Handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const { messages } = (await req.json()) as { messages: ChatMessage[] };

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey || apiKey === "your-openrouter-api-key-here") {
            return NextResponse.json(
                {
                    error:
                        "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to .env.local and restart the dev server.",
                },
                { status: 500 }
            );
        }

        const fullMessages: ChatMessage[] = [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
        ];

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://votercore.app",
                "X-Title": "VoterCore Campaign Intelligence",
            },
            body: JSON.stringify({
                model: MODEL,
                messages: fullMessages,
                reasoning: { enabled: true },
                stream: true,
                temperature: 0.65,
                max_tokens: 2048,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("OpenRouter error:", error);
            return NextResponse.json(
                { error: `OpenRouter API error: ${response.status}` },
                { status: response.status }
            );
        }

        // ── Stream SSE back to client ──────────────────────────────────────────
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) { controller.close(); return; }

                const decoder = new TextDecoder();
                let buffer = "";

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split("\n");
                        buffer = lines.pop() ?? "";

                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed || trimmed === "data: [DONE]") continue;
                            if (!trimmed.startsWith("data: ")) continue;
                            try {
                                const json = JSON.parse(trimmed.slice(6));
                                const delta = json.choices?.[0]?.delta;
                                const finishReason = json.choices?.[0]?.finish_reason;

                                if (delta?.content) {
                                    controller.enqueue(
                                        encoder.encode(`data: ${JSON.stringify({ type: "content", text: delta.content })}\n\n`)
                                    );
                                }
                                if (delta?.reasoning) {
                                    controller.enqueue(
                                        encoder.encode(`data: ${JSON.stringify({ type: "reasoning", text: delta.reasoning })}\n\n`)
                                    );
                                }
                                if (finishReason) {
                                    controller.enqueue(
                                        encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
                                    );
                                }
                            } catch { /* skip malformed */ }
                        }
                    }
                } finally {
                    reader.releaseLock();
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (err) {
        console.error("Chat API error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
