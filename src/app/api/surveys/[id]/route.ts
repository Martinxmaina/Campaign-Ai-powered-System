import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", id)
      .single();

    if (surveyError) return NextResponse.json({ error: "Survey not found" }, { status: 404 });

    const { data: questions } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", id)
      .order("sort_order", { ascending: true });

    return NextResponse.json({ survey, questions: questions || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Fetch current survey
    const { data: existing, error: fetchErr } = await supabase
      .from("surveys")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchErr) return NextResponse.json({ error: "Survey not found" }, { status: 404 });

    // Build update object from allowed fields
    const allowed = ["title", "description", "survey_type", "target_segment", "distribution", "closes_at", "status"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    if (Object.keys(update).length > 0) {
      const { error: updateErr } = await supabase
        .from("surveys")
        .update(update)
        .eq("id", id);

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    // Replace questions only if survey is draft and questions provided
    if (body.questions && existing.status === "draft") {
      // Delete all existing questions
      await supabase.from("survey_questions").delete().eq("survey_id", id);

      // Insert new ones
      const questionRecords = body.questions.map(
        (q: { question: string; type: string; options?: string[]; required?: boolean }, i: number) => ({
          survey_id: id,
          sort_order: i,
          question: q.question,
          type: q.type,
          options: q.options || [],
          required: q.required !== false,
        })
      );

      if (questionRecords.length > 0) {
        const { error: qErr } = await supabase
          .from("survey_questions")
          .insert(questionRecords);

        if (qErr) return NextResponse.json({ error: qErr.message }, { status: 400 });
      }

      // Update question count
      await supabase.from("surveys").update({ question_count: questionRecords.length }).eq("id", id);
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      action: "update",
      module: "surveys",
      record_id: id,
      details: { updated_fields: Object.keys(update), questions_replaced: !!body.questions },
      result: "success",
    });

    // Return updated survey + questions
    const { data: survey } = await supabase.from("surveys").select("*").eq("id", id).single();
    const { data: questions } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", id)
      .order("sort_order", { ascending: true });

    return NextResponse.json({ survey, questions: questions || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { error } = await supabase
      .from("surveys")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("audit_logs").insert({
      action: "delete",
      module: "surveys",
      record_id: id,
      details: { action: "archived" },
      result: "success",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
