import { NextRequest, NextResponse } from "next/server";
import { generateMessageVariants } from "@/lib/ai/claude";
import { requireAuth } from "@/utils/supabase/api-auth";

export async function POST(req: NextRequest) {
  const { auth, response } = await requireAuth(req);
  if (!auth) return response;

  try {
    const { topic, audience, channel, language = "english", count = 5 } = await req.json();
    if (!topic || !audience || !channel) {
      return NextResponse.json({ error: "topic, audience, and channel are required" }, { status: 400 });
    }
    const variants = await generateMessageVariants(topic, audience, channel, language, count);
    return NextResponse.json({ variants });
  } catch (err) {
    console.error("/api/generate-messages error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
