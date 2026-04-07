import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import type { CreateSurveyPayload } from "@/lib/surveys/types";

export async function GET(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;
    const status = new URL(req.url).searchParams.get("status");

    let query = supabase
      .from("surveys")
      .select("*")
      .neq("status", "archived")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ surveys: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateSurveyPayload;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    if (!body.title || !body.survey_type) {
      return NextResponse.json({ error: "title and survey_type are required" }, { status: 400 });
    }

    const surveyRecord = {
      title: body.title,
      description: body.description || null,
      survey_type: body.survey_type,
      target_segment: body.target_segment || {},
      distribution: body.distribution || [],
      closes_at: body.closes_at || null,
      question_count: body.questions?.length || 0,
      status: body.publish ? "active" : "draft",
      published_at: body.publish ? new Date().toISOString() : null,
    };

    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .insert(surveyRecord)
      .select()
      .single();

    if (surveyError) return NextResponse.json({ error: surveyError.message }, { status: 400 });

    // Insert questions if provided
    if (body.questions && body.questions.length > 0) {
      const questionRecords = body.questions.map((q, i) => ({
        survey_id: survey.id,
        sort_order: i,
        question: q.question,
        type: q.type,
        options: q.options || [],
        required: q.required !== false,
      }));

      const { error: questionsError } = await supabase
        .from("survey_questions")
        .insert(questionRecords);

      if (questionsError) {
        return NextResponse.json({ error: questionsError.message }, { status: 400 });
      }
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      action: "create",
      module: "surveys",
      record_id: survey.id,
      details: { title: survey.title, survey_type: survey.survey_type, published: !!body.publish },
      result: "success",
    });

    return NextResponse.json({ survey });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
