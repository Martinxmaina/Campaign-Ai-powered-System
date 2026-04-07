import { NextResponse } from "next/server";

const WEBHOOK_BASE = "https://votercore.app.n8n.cloud/webhook";

const WEBHOOKS = {
  exa: `${WEBHOOK_BASE}/exa-candidate-research`,
  perplexity: `${WEBHOOK_BASE}/perplexity-candidate-analysis`,
};

// Scraper workflow IDs for manual execution via n8n API
const SCRAPER_WORKFLOWS = {
  youtube: "RlpBqt4zsff9NlJj",
  tiktok: "4HrrBNTGezPCKNjz",
  facebook: "UKsP0fFrQznXwtyX",
  x_twitter: "QK5PMnXtIxZVv5bX",
  blog_news: "uUZSuvGh9IDf86Vp",
};

export async function POST() {
  try {
    const results: Record<string, string> = {};
    const payload = JSON.stringify({ trigger: "manual", timestamp: new Date().toISOString() });

    // Trigger research webhooks (Exa + Perplexity)
    for (const [name, url] of Object.entries(WEBHOOKS)) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
        results[name] = res.ok ? "triggered" : `failed (${res.status})`;
      } catch {
        results[name] = "unreachable";
      }
    }

    return NextResponse.json({
      status: "triggered",
      workflows: results,
      scraper_ids: SCRAPER_WORKFLOWS,
      message: "Research workflows triggered. Scrapers run on schedule (YouTube/Facebook 2h, TikTok 3h, X 30m, News 4h). Results appear within 5-10 minutes.",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
