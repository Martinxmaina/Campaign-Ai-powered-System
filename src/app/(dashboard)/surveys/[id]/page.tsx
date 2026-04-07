"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Send, Save, Pause, Play, CheckCircle,
  CircleDot, CheckSquare, Star, Type, ToggleLeft, BarChart3,
  Users, Clock, Trash2, ChevronUp, ChevronDown, Plus, X,
  Link2, Copy, Check, MessageCircle,
} from "lucide-react";
import type { Survey, SurveyQuestion, QuestionDraft } from "@/lib/surveys/types";
import { authFetch } from "@/utils/supabase/auth-fetch";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-600",
  completed: "bg-blue-50 text-blue-600",
  draft: "bg-amber-50 text-amber-600",
  paused: "bg-slate-100 text-slate-500",
};

const TYPE_LABELS: Record<string, string> = {
  voter_priority: "Voter Priority Poll",
  candidate_preference: "Candidate Preference",
  issue_satisfaction: "Issue Satisfaction",
  event_feedback: "Event Feedback",
  custom: "Custom Survey",
};

const QUESTION_TYPE_ICONS: Record<string, typeof CircleDot> = {
  single_choice: CircleDot,
  multiple_choice: CheckSquare,
  rating: Star,
  text: Type,
  yes_no: ToggleLeft,
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  rating: "Rating (1-5)",
  text: "Free Text",
  yes_no: "Yes / No",
};

const SURVEY_TYPES: { value: Survey["survey_type"]; label: string }[] = [
  { value: "voter_priority", label: "Voter Priority Poll" },
  { value: "candidate_preference", label: "Candidate Preference" },
  { value: "issue_satisfaction", label: "Issue Satisfaction" },
  { value: "event_feedback", label: "Event Feedback" },
  { value: "custom", label: "Custom Survey" },
];

const QUESTION_TYPES: { value: QuestionDraft["type"]; label: string }[] = [
  { value: "single_choice", label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "rating", label: "Rating (1-5)" },
  { value: "yes_no", label: "Yes / No" },
  { value: "text", label: "Free Text" },
];

const WARDS = ["Karandi", "Mirangine", "Gathanji", "Gatimu", "Rurii"];

function SharePanel({ surveyId }: { surveyId: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/survey/${surveyId}`
    : `/survey/${surveyId}`;

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const waText = encodeURIComponent(`Fill in this survey: ${url}`);
  const smsText = encodeURIComponent(`Fill in this survey: ${url}`);

  return (
    <div className="bg-white p-5 rounded-xl border border-[#EAEAEA]">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="h-4 w-4 text-[#787774]" />
        <h3 className="text-sm font-semibold text-[#111111]">Share this survey</h3>
      </div>
      <div className="flex items-center gap-2 p-3 bg-[#F7F6F3] rounded-[8px] border border-[#EAEAEA] mb-3">
        <span className="flex-1 text-xs text-[#787774] truncate font-mono">{url}</span>
        <button
          onClick={copy}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#111111] text-white text-xs font-medium hover:bg-[#333333] active:scale-[0.98] transition-all"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="flex gap-2">
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#EAEAEA] text-xs font-medium text-[#2F3437] hover:border-[#111111] transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5 text-[#346538]" />
          WhatsApp
        </a>
        <a
          href={`sms:?body=${smsText}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#EAEAEA] text-xs font-medium text-[#2F3437] hover:border-[#111111] transition-colors"
        >
          <Send className="h-3.5 w-3.5 text-[#1F6C9F]" />
          SMS
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#EAEAEA] text-xs font-medium text-[#2F3437] hover:border-[#111111] transition-colors"
        >
          <Link2 className="h-3.5 w-3.5" />
          Open form
        </a>
      </div>
    </div>
  );
}

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit state (for draft surveys)
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<Survey["survey_type"]>("custom");
  const [editQuestions, setEditQuestions] = useState<QuestionDraft[]>([]);

  useEffect(() => {
    authFetch(`/api/surveys/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setSurvey(d.survey);
        setQuestions(d.questions || []);
        setEditTitle(d.survey?.title || "");
        setEditDescription(d.survey?.description || "");
        setEditType(d.survey?.survey_type || "custom");
        setEditQuestions(
          (d.questions || []).map((q: SurveyQuestion) => ({
            tempId: q.id,
            question: q.question,
            type: q.type,
            options: (q.options as string[]) || [],
            required: q.required,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const isDraft = survey?.status === "draft";

  async function handleUpdate() {
    setSaving(true);
    try {
      const payload = {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        survey_type: editType,
        questions: editQuestions
          .filter((q) => q.question.trim())
          .map((q) => ({
            question: q.question.trim(),
            type: q.type,
            options: q.options.filter((o) => o.trim()),
            required: q.required,
          })),
      };

      const res = await authFetch(`/api/surveys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const { survey: updated, questions: updatedQ } = await res.json();
        setSurvey(updated);
        setQuestions(updatedQ || []);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setSaving(true);
    try {
      // Save first if draft
      if (isDraft) await handleUpdate();

      const res = await authFetch(`/api/surveys/${id}/publish`, { method: "POST" });
      if (res.ok) {
        setSurvey((prev) => prev ? { ...prev, status: "active", published_at: new Date().toISOString() } : prev);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to publish");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status: string) {
    const res = await authFetch(`/api/surveys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const { survey: updated } = await res.json();
      setSurvey(updated);
    }
  }

  async function handleDelete() {
    if (!confirm("Archive this survey?")) return;
    const res = await authFetch(`/api/surveys/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/surveys");
  }

  function moveQuestion(index: number, direction: "up" | "down") {
    const next = [...editQuestions];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setEditQuestions(next);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="p-6 text-center text-slate-500">
        Survey not found. <Link href="/surveys" className="text-blue-600 hover:underline">Back to surveys</Link>
      </div>
    );
  }

  // ── DRAFT MODE: Full editor ──────────────────────────────────────────────
  if (isDraft) {
    const hasChoiceType = (type: string) => ["single_choice", "multiple_choice"].includes(type);
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/surveys" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4 text-slate-500" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-bold text-slate-900">Edit Survey (Draft)</h1>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES.draft}`}>Draft</span>
        </div>

        {/* Survey Details */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Title</label>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Description</label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Survey Type</label>
            <select value={editType} onChange={(e) => setEditType(e.target.value as Survey["survey_type"])} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              {SURVEY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Questions Editor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Questions ({editQuestions.length})</h2>
            <button type="button" onClick={() => setEditQuestions([...editQuestions, { tempId: Math.random().toString(36).slice(2), question: "", type: "single_choice", options: ["", ""], required: true }])} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Question
            </button>
          </div>

          {editQuestions.map((q, qi) => (
            <div key={q.tempId} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-0.5 mt-1">
                  <button type="button" onClick={() => moveQuestion(qi, "up")} disabled={qi === 0} className="p-0.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => moveQuestion(qi, "down")} disabled={qi === editQuestions.length - 1} className="p-0.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                </div>
                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mt-1.5">{qi + 1}</span>
                <div className="flex-1 space-y-2">
                  <input value={q.question} onChange={(e) => { const n = [...editQuestions]; n[qi] = { ...n[qi], question: e.target.value }; setEditQuestions(n); }} placeholder="Enter your question..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  <div className="flex items-center gap-3">
                    <select value={q.type} onChange={(e) => { const n = [...editQuestions]; const newType = e.target.value as QuestionDraft["type"]; n[qi] = { ...n[qi], type: newType, options: hasChoiceType(newType) && n[qi].options.length < 2 ? ["", ""] : !hasChoiceType(newType) ? [] : n[qi].options }; setEditQuestions(n); }} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white">
                      {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={q.required} onChange={(e) => { const n = [...editQuestions]; n[qi] = { ...n[qi], required: e.target.checked }; setEditQuestions(n); }} className="rounded border-slate-300" /> Required
                    </label>
                  </div>
                </div>
                <button type="button" onClick={() => setEditQuestions(editQuestions.filter((_, i) => i !== qi))} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors mt-1"><Trash2 className="h-4 w-4" /></button>
              </div>
              {hasChoiceType(q.type) && (
                <div className="ml-10 space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-4">{oi + 1}.</span>
                      <input value={opt} onChange={(e) => { const n = [...editQuestions]; n[qi].options = [...n[qi].options]; n[qi].options[oi] = e.target.value; setEditQuestions(n); }} placeholder={`Option ${oi + 1}`} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white" />
                      {q.options.length > 2 && <button type="button" onClick={() => { const n = [...editQuestions]; n[qi].options = n[qi].options.filter((_, i) => i !== oi); setEditQuestions(n); }} className="p-1 text-slate-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>}
                    </div>
                  ))}
                  <button type="button" onClick={() => { const n = [...editQuestions]; n[qi].options = [...n[qi].options, ""]; setEditQuestions(n); }} className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-6">+ Add option</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleUpdate} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Draft
          </button>
          <button onClick={handlePublish} disabled={saving || editQuestions.length === 0} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <Send className="h-4 w-4" /> Publish
          </button>
          <button onClick={handleDelete} className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-red-500 text-sm font-medium hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Archive
          </button>
        </div>
      </div>
    );
  }

  // ── ACTIVE / COMPLETED / PAUSED: Read-only view ──────────────────────────
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/surveys" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-slate-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg md:text-xl font-bold text-slate-900">{survey.title}</h1>
          {survey.description && <p className="text-sm text-slate-500 mt-0.5">{survey.description}</p>}
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[survey.status] || "bg-slate-100 text-slate-400"}`}>
          {survey.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium uppercase">Responses</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{survey.response_count.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium uppercase">Completion Rate</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{Math.round(survey.completion_rate || 0)}%</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium uppercase">Questions</span>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{survey.question_count}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div><span className="text-slate-500 block mb-1">Type</span><span className="font-medium text-slate-800">{TYPE_LABELS[survey.survey_type] || survey.survey_type}</span></div>
          <div><span className="text-slate-500 block mb-1">Created</span><span className="font-medium text-slate-800">{new Date(survey.created_at).toLocaleDateString()}</span></div>
          {survey.published_at && <div><span className="text-slate-500 block mb-1">Published</span><span className="font-medium text-slate-800">{new Date(survey.published_at).toLocaleDateString()}</span></div>}
          {survey.closes_at && <div><span className="text-slate-500 block mb-1">Closes</span><span className="font-medium text-slate-800">{new Date(survey.closes_at).toLocaleDateString()}</span></div>}
        </div>
        {survey.target_segment && Object.keys(survey.target_segment).length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 block mb-2">Target Segment</span>
            <div className="flex flex-wrap gap-1.5">
              {(survey.target_segment.wards || []).map((w) => <span key={w} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">{w}</span>)}
              {(survey.target_segment.age_groups || []).map((a) => <span key={a} className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded text-[10px] font-medium">{a}</span>)}
              {(survey.target_segment.support_levels || []).map((s) => <span key={s} className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-medium">{s.replace(/_/g, " ")}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Share link — shown when active */}
      {survey.status === "active" && <SharePanel surveyId={id} />}

      {/* Questions list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Questions</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {questions.map((q, i) => {
            const QIcon = QUESTION_TYPE_ICONS[q.type] || CircleDot;
            return (
              <div key={q.id} className="px-6 py-4 flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{q.question}{q.required && <span className="text-red-400 ml-1">*</span>}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <QIcon className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">{QUESTION_TYPE_LABELS[q.type] || q.type}</span>
                    {(q.options as string[])?.length > 0 && <span className="text-xs text-slate-400">({(q.options as string[]).length} options)</span>}
                  </div>
                  {(q.options as string[])?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(q.options as string[]).map((o, oi) => <span key={oi} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">{o}</span>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {survey.status === "active" && (
          <>
            <Link href={`/surveys/${id}/responses`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
              <BarChart3 className="h-4 w-4" /> View Analytics
            </Link>
            <button onClick={() => handleStatusChange("paused")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50">
              <Pause className="h-4 w-4" /> Pause
            </button>
            <button onClick={() => handleStatusChange("completed")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50">
              <CheckCircle className="h-4 w-4" /> Complete
            </button>
          </>
        )}
        {survey.status === "paused" && (
          <>
            <button onClick={() => handleStatusChange("active")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
              <Play className="h-4 w-4" /> Resume
            </button>
            <Link href={`/surveys/${id}/responses`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50">
              <BarChart3 className="h-4 w-4" /> View Analytics
            </Link>
          </>
        )}
        {survey.status === "completed" && (
          <Link href={`/surveys/${id}/responses`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
            <BarChart3 className="h-4 w-4" /> View Analytics
          </Link>
        )}
        <button onClick={handleDelete} className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-red-500 text-sm font-medium hover:bg-red-50">
          <Trash2 className="h-4 w-4" /> Archive
        </button>
      </div>
    </div>
  );
}
