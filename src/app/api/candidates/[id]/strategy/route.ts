import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateCandidateStrategy } from "@/lib/ai/claude";

export async function POST(
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

    const { data: allCandidates } = await supabase
      .from("candidates")
      .select("id, name, party, win_prob, momentum, threat_level")
      .order("win_prob", { ascending: false });

    const strategy = await generateCandidateStrategy(
      candidate.name,
      candidate as Record<string, unknown>,
      (allCandidates ?? []) as Record<string, unknown>[]
    );

    return NextResponse.json({ strategy });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
