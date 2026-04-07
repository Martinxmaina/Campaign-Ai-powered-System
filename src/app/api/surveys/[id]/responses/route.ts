import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import type { SubmitResponsePayload, QuestionStats } from "@/lib/surveys/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as SubmitResponsePayload;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Verify survey is active
    const { data: survey, error: surveyErr } = await supabase
      .from("surveys")
      .select("id, status")
      .eq("id", id)
      .single();

    if (surveyErr || !survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    if (survey.status !== "active") {
      return NextResponse.json({ error: "Survey is not accepting responses" }, { status: 400 });
    }

    if (!body.answers || body.answers.length === 0) {
      return NextResponse.json({ error: "At least one answer is required" }, { status: 400 });
    }

    // Optionally link to voter_contacts
    let voterContactId: string | null = null;
    if (body.respondent_phone) {
      const { data: existing } = await supabase
        .from("voter_contacts")
        .select("id, contact_count")
        .eq("phone", body.respondent_phone)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("voter_contacts")
          .update({
            contact_count: (existing.contact_count || 0) + 1,
            last_contact: new Date().toISOString(),
          })
          .eq("id", existing.id);
        voterContactId = existing.id;
      } else {
        const { data: newContact } = await supabase
          .from("voter_contacts")
          .insert({
            phone: body.respondent_phone,
            name: body.respondent_name || null,
            ward: body.ward || null,
            age_group: body.age_group || null,
            source: "survey",
            contact_count: 1,
            last_contact: new Date().toISOString(),
          })
          .select("id")
          .single();
        voterContactId = newContact?.id || null;
      }
    }

    // Insert response
    const { data: response, error: respErr } = await supabase
      .from("survey_responses")
      .insert({
        survey_id: id,
        voter_contact_id: voterContactId,
        respondent_phone: body.respondent_phone || null,
        respondent_name: body.respondent_name || null,
        ward: body.ward || null,
        age_group: body.age_group || null,
        completed: true,
      })
      .select()
      .single();

    if (respErr) return NextResponse.json({ error: respErr.message }, { status: 400 });

    // Insert answers
    const answerRecords = body.answers.map((a) => ({
      response_id: response.id,
      question_id: a.question_id,
      answer: a.answer,
    }));

    const { error: ansErr } = await supabase.from("survey_answers").insert(answerRecords);
    if (ansErr) return NextResponse.json({ error: ansErr.message }, { status: 400 });

    return NextResponse.json({ response_id: response.id, success: true });
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Fetch survey
    const { data: survey, error: surveyErr } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", id)
      .single();

    if (surveyErr || !survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    // Fetch questions
    const { data: questions } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", id)
      .order("sort_order", { ascending: true });

    // Fetch all responses
    const { data: responses } = await supabase
      .from("survey_responses")
      .select("*")
      .eq("survey_id", id);

    const responseIds = (responses || []).map((r: Record<string, unknown>) => r.id as string);

    // Fetch all answers
    let answers: Record<string, unknown>[] = [];
    if (responseIds.length > 0) {
      const { data } = await supabase
        .from("survey_answers")
        .select("*")
        .in("response_id", responseIds);
      answers = (data || []) as Record<string, unknown>[];
    }

    // Compute per-question stats
    const questionStats: QuestionStats[] = (questions || []).map((q: Record<string, unknown>) => {
      const qAnswers = answers.filter((a) => a.question_id === q.id);
      const stat: QuestionStats = {
        question_id: q.id as string,
        question: q.question as string,
        type: q.type as QuestionStats["type"],
        options: (q.options as string[]) || [],
        total_answers: qAnswers.length,
      };

      if (q.type === "single_choice" || q.type === "multiple_choice" || q.type === "yes_no") {
        const counts: Record<string, number> = {};
        for (const a of qAnswers) {
          const ans = a.answer as Record<string, unknown>;
          if (q.type === "multiple_choice" && Array.isArray(ans.values)) {
            for (const v of ans.values as string[]) {
              counts[v] = (counts[v] || 0) + 1;
            }
          } else if (q.type === "yes_no") {
            const label = ans.value === true ? "Yes" : "No";
            counts[label] = (counts[label] || 0) + 1;
          } else {
            const v = String(ans.value || "");
            if (v) counts[v] = (counts[v] || 0) + 1;
          }
        }
        stat.option_counts = counts;
      } else if (q.type === "rating") {
        let sum = 0;
        const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const a of qAnswers) {
          const v = Number((a.answer as Record<string, unknown>).value) || 0;
          sum += v;
          if (v >= 1 && v <= 5) dist[v] = (dist[v] || 0) + 1;
        }
        stat.average = qAnswers.length > 0 ? Math.round((sum / qAnswers.length) * 10) / 10 : 0;
        stat.distribution = dist;
      } else if (q.type === "text") {
        stat.text_responses = qAnswers
          .map((a) => String((a.answer as Record<string, unknown>).value || ""))
          .filter(Boolean)
          .slice(0, 100);
      }

      return stat;
    });

    // Ward breakdown
    const wardBreakdown: Record<string, number> = {};
    for (const r of (responses || []) as Record<string, unknown>[]) {
      const w = (r.ward as string) || "Unknown";
      wardBreakdown[w] = (wardBreakdown[w] || 0) + 1;
    }

    const totalResponses = responses?.length || 0;
    const completedResponses = responses?.filter((r: Record<string, unknown>) => r.completed).length || 0;

    return NextResponse.json({
      survey,
      questions: questions || [],
      total_responses: totalResponses,
      completed_responses: completedResponses,
      completion_rate: totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0,
      question_stats: questionStats,
      ward_breakdown: wardBreakdown,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
