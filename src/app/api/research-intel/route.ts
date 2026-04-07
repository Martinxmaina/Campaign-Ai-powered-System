import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const url = new URL(req.url);
    const ward = url.searchParams.get("ward");
    const type = url.searchParams.get("type");
    const candidateId = url.searchParams.get("candidate_id");
    const priority = url.searchParams.get("priority");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    let query = supabase
      .from("field_reports")
      .select("*, candidates(id, name, party)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (ward) query = query.eq("ward", ward);
    if (type) query = query.eq("report_type", type);
    if (candidateId) query = query.eq("candidate_id", candidateId);
    if (priority) query = query.eq("priority", priority);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ reports: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    if (!body.ward || !body.report_type) {
      return NextResponse.json({ error: "ward and report_type are required" }, { status: 400 });
    }

    // Structure the intel data into the notes field as JSON
    const intelData = {
      intel_type: body.intel_type || body.report_type,
      source_type: body.source_type || null,
      source_credibility: body.source_credibility || null,
      classification: body.classification || null,
      intelligence_summary: body.intelligence_summary || null,
      actionable_recommendation: body.actionable_recommendation || null,
      source_language: body.source_language || null,
      detailed_notes: body.detailed_notes || body.notes || null,
    };

    const record = {
      ward: body.ward,
      location: body.location || null,
      report_type: body.report_type,
      candidate_id: body.candidate_id || null,
      mood_score: body.mood_score || null,
      notes: JSON.stringify(intelData),
      priority: body.priority || "normal",
      photo_url: body.photo_url || null,
    };

    const { data, error } = await supabase
      .from("field_reports")
      .insert(record)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try { await (supabase as any).from("audit_logs").insert({ action: "create", module: "research", record_id: data.id, details: { ward: record.ward, report_type: record.report_type }, result: "success" }); } catch {}
    return NextResponse.json({ report: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
