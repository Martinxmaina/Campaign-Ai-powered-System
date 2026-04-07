import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Verify survey exists and has questions
    const { data: survey, error: fetchErr } = await supabase
      .from("surveys")
      .select("id, status, question_count")
      .eq("id", id)
      .single();

    if (fetchErr || !survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    if (survey.question_count < 1) {
      // Double-check by counting questions directly
      const { count } = await supabase
        .from("survey_questions")
        .select("id", { count: "exact", head: true })
        .eq("survey_id", id);

      if (!count || count < 1) {
        return NextResponse.json(
          { error: "Survey must have at least 1 question before publishing" },
          { status: 400 }
        );
      }
    }

    const { error: updateErr } = await supabase
      .from("surveys")
      .update({
        status: "active",
        published_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 400 });

    await supabase.from("audit_logs").insert({
      action: "update",
      module: "surveys",
      record_id: id,
      details: { action: "publish" },
      result: "success",
    });

    return NextResponse.json({ success: true, status: "active" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
