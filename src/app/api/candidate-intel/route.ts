import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("candidate_intel")
      .select("*, candidates(id, name, party, photo_url, is_our_candidate, mention_count_7d, aliases)")
      .order("fame_rank", { ascending: true, nullsFirst: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ intel: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    if (!body.candidate_id) {
      return NextResponse.json({ error: "candidate_id is required" }, { status: 400 });
    }

    const allowed = [
      "candidate_id", "party_affiliation", "campaign_platforms",
      "social_media_followers", "local_endorsements", "popularity_notes",
      "party_support_breakdown", "fame_rank", "exa_research",
      "perplexity_analysis", "sources",
    ];
    const payload: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) payload[key] = body[key];
    }

    const { data, error } = await supabase
      .from("candidate_intel")
      .upsert(payload as { candidate_id: string; [key: string]: unknown }, { onConflict: "candidate_id" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ intel: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
