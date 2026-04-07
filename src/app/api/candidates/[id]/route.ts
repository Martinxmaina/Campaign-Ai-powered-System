import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAuth, requireRole, MANAGER_ROLES } from "@/utils/supabase/api-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { auth, response } = await requireAuth(req);
  if (!auth) return response;
  const roleError = requireRole(auth, MANAGER_ROLES);
  if (roleError) return roleError;

  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = createAdminClient();

    // Allowed fields to update
    const allowed = ["party", "bio", "threat_level", "photo_url", "is_our_candidate", "name", "aliases",
        "twitter_handle", "facebook_url", "instagram_handle", "youtube_url", "tiktok_url"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    // If marking as our candidate, unmark all others first
    if (updates.is_our_candidate === true) {
      await supabase
        .from("candidates")
        .update({ is_our_candidate: false })
        .neq("id", id);
    }

    const { data, error } = await supabase
      .from("candidates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try { await (supabase as any).from("audit_logs").insert({ action: "update", module: "candidates", record_id: id, details: updates, result: "success" }); } catch {}
    return NextResponse.json({ candidate: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: candidate, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    // Candidate history (last 30 days)
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: history } = await supabase
      .from("candidates_history")
      .select("*")
      .eq("candidate_id", id)
      .gte("snapshot_at", since.toISOString())
      .order("snapshot_at", { ascending: true });

    // Recent mentions
    const { data: mentions } = await supabase
      .from("analyzed_posts")
      .select("*, raw_posts(*)")
      .contains("candidates_mentioned", [candidate.name])
      .order("analyzed_at", { ascending: false })
      .limit(20);

    // All candidates for comparison
    const { data: allCandidates } = await supabase
      .from("candidates")
      .select("id, name, party, win_prob, momentum, threat_level, is_our_candidate")
      .order("win_prob", { ascending: false });

    // Candidate intel (social media followers, etc.)
    const { data: intel } = await supabase
      .from("candidate_intel")
      .select("social_media_followers, platforms_active, last_post_at")
      .eq("candidate_id", id)
      .maybeSingle();

    return NextResponse.json({ candidate, history: history ?? [], mentions: mentions ?? [], allCandidates: allCandidates ?? [], intel: intel ?? null });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
