// Claude AI client — routed via OpenRouter (OpenAI-compatible API)
// Uses ANTHROPIC_API_KEY as the OpenRouter key

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const DEFAULT_MODEL = "anthropic/claude-sonnet-4-5";

export const AI_MODELS = [
    { id: "anthropic/claude-sonnet-4-5", label: "Claude Sonnet", short: "Sonnet" },
    { id: "anthropic/claude-opus-4",     label: "Claude Opus",   short: "Opus"   },
    { id: "openai/gpt-4o",               label: "GPT-4o",        short: "GPT-4o" },
    { id: "google/gemini-pro-1.5",       label: "Gemini 1.5",    short: "Gemini" },
] as const;

export type AiModelId = typeof AI_MODELS[number]["id"];

/** Build the analysis system prompt dynamically from live candidate data. */
export function buildAnalysisPrompt(
  candidates: { name: string; party?: string | null; aliases?: string[] | null; is_our_candidate?: boolean | null }[]
): string {
  const candidateList = candidates
    .map((c, i) => {
      const aliasStr = c.aliases?.length ? ` (aliases: ${c.aliases.join(", ")})` : "";
      const partyStr = c.party ? ` — ${c.party}` : "";
      const ourStr = c.is_our_candidate ? " ← OUR CANDIDATE" : "";
      return `${i + 1}. ${c.name}${aliasStr}${partyStr}${ourStr}`;
    })
    .join("\n");

  return `You are an AI analyst for a Kenyan political campaign in Ol Kalou constituency, Nyandarua County.
You understand English, Swahili, Kikuyu (Gikuyu), and Sheng (Kenyan youth slang).

CAMPAIGN IDENTITY: We are the campaign HQ for the UDA (United Democratic Alliance) candidate. UDA is President Ruto's party, aligned with the Kenya Kwanza / bottom-up economy agenda. All analysis should be framed from the UDA campaign's perspective — UDA-positive sentiment is favourable to us; DCP and opposition sentiment are threat signals.

Context: This by-election was triggered by the death of the previous MP.
Key political dynamics: UDA (Ruto) vs DCP (Rigathi Gachagua) split in Mt. Kenya region. We are the UDA side.
Coded references to watch: "Anaconda" = political manipulation, "Hustler" = UDA alignment (positive for us), "System" = establishment/DCP candidate, "Mt. Kenya Unity" = central region bloc often used by DCP to consolidate against UDA.
Constituency wards: Ol Kalou, Karagoini, Dundori, Githabai, Wanjohi, Gathanji, Rurii.
Common issues: poverty, electricity access, water scarcity, road infrastructure, youth unemployment, land issues.

The candidates in the Ol Kalou parliamentary by-election are:
${candidateList}

Always resolve aliases and partial names to the canonical full name listed above.
For Kikuyu text: pay special attention to political metaphors and cultural references.
Party keywords: UDA (hustler, bottom-up, Kenya Kwanza), DCP (gachagua, rigathi, democratic congress), Jubilee, ODM (raila, odinga), Wiper (kalonzo), ANC (mudavadi), Ford Kenya (wetangula).

For each item in the batch, return a JSON object with:
- language: detected language (english|swahili|kikuyu|sheng|mixed)
- translation: English translation (null if already English)
- sentiment: positive|negative|neutral
- sentiment_score: float -1.0 to 1.0
- intent: vote_intent|criticism|support|neutral|spam|coordination
- candidates_mentioned: array of canonical candidate names from the list above
- parties_mentioned: array (UDA|Jubilee|ODM|DCP|Wiper|Ford Kenya|ANC|Independent)
- issues: array (cost_of_living|healthcare|education|infrastructure|corruption|youth_unemployment|security|water|electricity|land|other)
- key_insight: one sentence — what is this actually saying?
- relevance_score: 0.0-1.0 relevance to Ol Kalou election
- is_bot_suspected: true if signs of coordinated inauthentic behaviour

Return ONLY a valid JSON array. No preamble, no explanation.`;
}

export const RAG_SYSTEM_PROMPT = `You are an expert AI Campaign Strategy Assistant for VoterCore — a political campaign intelligence platform.
You have access to live campaign intelligence data provided as context. Ground every response in this data.

IMPORTANT: You are working exclusively for the UDA (United Democratic Alliance) campaign in the Ol Kalou by-election. UDA is aligned with President Ruto's Kenya Kwanza / bottom-up economy agenda. Always frame your recommendations in terms of what benefits the UDA candidate and advances UDA's electoral goals. DCP (Gachagua's party) is the primary opposition threat.

Always structure responses with:
- **Key Insight** (1-2 sentences)
- **Analysis** (data-grounded breakdown)
- **Recommendation** (actionable next steps for the UDA campaign)
- **Sources** (cite specific data from the context)

Use markdown. Be concise and actionable.`;

interface ClaudeMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function getHeaders() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "HTTP-Referer": "https://votercore.app",
    "X-Title": "VoterCore",
  };
}

export async function claudeComplete(
  system: string,
  messages: ClaudeMessage[],
  maxTokens = 4096,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const allMessages: ClaudeMessage[] = [
    { role: "system", content: system },
    ...messages,
  ];

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: allMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function analyzePosts(
  posts: { id: string; content: string; platform: string; author?: string | null }[],
  candidates: { name: string; party?: string | null; aliases?: string[] | null; is_our_candidate?: boolean | null }[]
) {
  const prompt = buildAnalysisPrompt(candidates);
  const text = await claudeComplete(
    prompt,
    [{ role: "user", content: `Analyze this batch of ${posts.length} social media posts:\n\n${JSON.stringify(posts)}` }]
  );
  return JSON.parse(text) as Record<string, unknown>[];
}

export async function ragSynthesize(query: string, context: string, model: string = DEFAULT_MODEL): Promise<string> {
  return claudeComplete(
    RAG_SYSTEM_PROMPT,
    [{ role: "user", content: `## Campaign Intelligence Context\n\n${context}\n\n## Question\n\n${query}` }],
    2048,
    model
  );
}

export async function generateMessageVariants(
  topic: string, audience: string, channel: string, language: string, count: number
) {
  const text = await claudeComplete(
    "You are a political communications expert working for the UDA (United Democratic Alliance) campaign in Ol Kalou, Nyandarua County. All messages must reflect UDA's Kenya Kwanza / bottom-up economy values and advance the UDA candidate's electoral interests. Frame every message around the hustler nation movement and President Ruto's development agenda.",
    [{
      role: "user",
      content: `Generate ${count} message variants for:
- Topic: ${topic}
- Audience: ${audience}
- Channel: ${channel}
- Language: ${language}

Return a JSON array where each object has: variant_id ("A","B"...), content, tone, estimated_impact ("high"|"medium"|"low").
Return ONLY valid JSON.`
    }]
  );
  return JSON.parse(text) as { variant_id: string; content: string; tone: string; estimated_impact: string }[];
}

export async function generateCandidateStrategy(
  candidateName: string,
  candidateData: Record<string, unknown>,
  allCandidates: Record<string, unknown>[],
): Promise<string> {
  const context = `
Candidate: ${candidateName}
Win Probability: ${candidateData.win_prob}%
Momentum: ${candidateData.momentum}
Sentiment: ${candidateData.sentiment_positive}% positive
Mentions (7d): ${candidateData.mention_count_7d}
Party: ${candidateData.party}
Threat Level: ${candidateData.threat_level}

All candidates in Ol Kalou by-election:
${allCandidates.map((c: Record<string, unknown>) => `- ${c.name}: ${c.win_prob}% win prob, ${c.party}`).join("\n")}
`;

  return claudeComplete(
    `You are a senior political strategist working for the UDA (United Democratic Alliance) campaign in the Ol Kalou parliamentary by-election. UDA is President Ruto's party — Kenya Kwanza, bottom-up economy, hustler nation. Our goal is to elect the UDA candidate. DCP (Gachagua's party) is the primary threat and must be neutralised. Provide a brutally honest, data-driven strategic assessment from the UDA campaign's perspective. Be specific and actionable.`,
    [{
      role: "user",
      content: `Generate a political intelligence report for ${candidateName} in the Ol Kalou parliamentary by-election.

${context}

Provide:
## Win Probability Assessment
Brief analysis of their current position and trajectory.

## Key Strengths
Bullet points of what's working in their favour.

## Vulnerabilities
Bullet points of weaknesses that can be exploited.

## Counter-Strategy
If this is an opponent — specific tactics to reduce their support and win ground from them.
If this is our candidate — specific tactics to maximise their chances.

## 3D Political Chess Moves
Advanced strategic plays: coalition building, narrative warfare, timing, ground game, digital strategy.

## Immediate Actions (Next 7 Days)
Three specific, executable actions.`
    }],
    2000
  );
}
