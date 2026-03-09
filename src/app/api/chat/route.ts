import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "qwen/qwen3-30b-a3b";

// ─── Campaign Intelligence Context ───────────────────────────────────────────
const CAMPAIGN_CONTEXT = `
## CAMPAIGN INTELLIGENCE BRIEFING (2027 Kenyan General Election)

### COST OF LIVING CRISIS — TALKING POINTS
Source: VoterCore Internal Research, March 2027

**Rising Inflation & Basic Needs**
- Nairobi: Inflation at 8.5%, food prices up 12% YoY. Households spend 40% of income on essentials (maize, beans, fuel).
- Mombasa: 15% surge in imported goods (rice, cooking oil). 60% of families report "stretching meals" due to rising costs.

**Youth & Low-Income Struggles**
- Kisumu: 25% youth unemployment. 40% of students in public schools report inadequate school meals due to family budget cuts.
- Nakuru: Informal sector workers (30% of labor force) face 20% wage erosion vs. 10% inflation, eroding purchasing power.

**Healthcare & Education Burden**
- Eldoret: 50% of households delay medical care due to costs. Tuition fees for public universities rose 18% in 2027.
- Mombasa: 30% of families spend 50%+ of income on housing; rental prices up 25% since 2024.

**Campaign Solutions**
- Cap essential food prices at 10% above 2023 levels; expand subsidies for low-income families.
- Create 50,000 jobs in agriculture and tech hubs across Nairobi and Kisumu.
- Free primary education and tuition waivers for public university students in Mombasa and Eldoret.

**Key Message Frame**: "Failure of the status quo" → position campaign as the only viable path to affordable living.

### SENTIMENT & ENGAGEMENT DATA
Source: VoterCore Analytics Dashboard, March 2027

- Overall voter sentiment: 68% positive (+5.2% MoM)
- Message engagement rate: 4.2% (+0.8%)
- Total donors: 12,482 (+12%)
- Recent media hits: 124 (target: 150)
- Email open rates: Weekly Update #14 (82%), Policy Paper (65%), Donation Match Alert (91%)

### TOP TRENDING ISSUES (Social Listening)
1. #UngaPrices — 45.2K mentions, +320% surge — NEGATIVE sentiment
2. #CBCReform — 28.4K mentions, +180% — MIXED
3. #HealthcareForAll — 22.1K mentions, +95% — POSITIVE
4. #JobCreation — 18.9K mentions, +67% — POSITIVE
5. #InfrastructureDev — 15.3K mentions, +42% — MIXED

### WAR ROOM — ACTIVE THREATS
- Disinformation campaign targeting Nakuru voters with false healthcare claims (CRITICAL — 92% severity)
- Opposition ad spend on Facebook up 340% in Nairobi (WARNING)
- Voter suppression messaging in Kisumu (ESCALATED — 85% severity)

### COUNTY PERFORMANCE
- Nairobi: 68% positive sentiment, strong support
- Mombasa: 72% positive, strong support
- Kisumu: 45% positive — SWING COUNTY (high priority)
- Nakuru: 58% positive — swing county
- Eldoret: 65% positive, mostly supporter base
`;

const SYSTEM_PROMPT = `You are an expert AI Campaign Strategy Assistant for VoterCore, a political campaign intelligence platform supporting the 2027 Kenyan General Election.

Your role is to provide data-driven strategic recommendations by analyzing the campaign intelligence briefing below.

${CAMPAIGN_CONTEXT}

## YOUR RESPONSIBILITIES

1. **Strategy Recommendations**: Ground every recommendation in the data above.
2. **Messaging Advice**: Help craft targeted messaging for specific counties and demographics.
3. **Threat Analysis**: Help respond to War Room alerts and opposition tactics.
4. **Voter Outreach**: Recommend channel, timing, and targeting approaches.
5. **Issue Framing**: Help frame issues using the provided talking points.

## RESPONSE FORMAT

Always structure responses with:
- **Key Insight** (1 sentence summary)
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
