"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2, ChevronRight, ChevronLeft, Loader2,
  WifiOff, Send, Star, AlertCircle,
} from "lucide-react";
import type { SurveyWithQuestions, SurveyQuestion, SubmitResponsePayload } from "@/lib/surveys/types";

// ── Offline queue via IndexedDB ──────────────────────────────────────────────
const SURVEY_DB = "votercore-offline";
const SURVEY_STORE = "pending_surveys";

async function openSurveyDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SURVEY_DB, 2);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SURVEY_STORE)) {
        db.createObjectStore(SURVEY_STORE, { autoIncrement: true });
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
}

async function queueSurveyResponse(surveyId: string, payload: SubmitResponsePayload): Promise<void> {
  const db = await openSurveyDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SURVEY_STORE, "readwrite");
    tx.objectStore(SURVEY_STORE).add({ surveyId, payload, timestamp: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── Question renderer ─────────────────────────────────────────────────────────
function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const inputClass =
    "w-full px-4 py-3 rounded-[8px] border border-[#EAEAEA] bg-white text-[#111111] text-sm focus:outline-none focus:border-[#111111] transition-colors placeholder:text-[#B0ADAA]";

  switch (question.type) {
    case "section_header":
      return (
        <div className="py-2 border-b border-[#EAEAEA]">
          <p className="text-xs text-[#787774] uppercase tracking-widest font-medium">{question.question}</p>
        </div>
      );

    case "short_text":
    case "email":
    case "phone":
    case "number": {
      const typeMap: Record<string, string> = { email: "email", phone: "tel", number: "number", short_text: "text" };
      return (
        <input
          type={typeMap[question.type] || "text"}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || ""}
          className={inputClass}
        />
      );
    }

    case "text":
    case "long_text":
      return (
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || "Write your answer here..."}
          rows={4}
          className={`${inputClass} resize-none`}
        />
      );

    case "date":
      return (
        <input
          type="date"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );

    case "yes_no":
      return (
        <div className="flex gap-3">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt === "Yes")}
              className={`flex-1 py-3 rounded-[8px] border text-sm font-medium transition-colors ${
                (opt === "Yes" ? value === true : value === false)
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#EAEAEA] bg-white text-[#2F3437] hover:border-[#111111]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );

    case "single_choice":
    case "dropdown":
      if (question.type === "dropdown") {
        return (
          <select
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Select an option…</option>
            {(question.options as string[]).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }
      return (
        <div className="space-y-2">
          {(question.options as string[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[8px] border text-sm transition-colors text-left ${
                value === opt
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#EAEAEA] bg-white text-[#2F3437] hover:border-[#111111]"
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                value === opt ? "border-white" : "border-[#EAEAEA]"
              }`}>
                {value === opt && <span className="w-2 h-2 rounded-full bg-white" />}
              </span>
              {opt}
            </button>
          ))}
        </div>
      );

    case "multiple_choice": {
      const selected: string[] = Array.isArray(value) ? (value as string[]) : [];
      const toggle = (opt: string) => {
        if (selected.includes(opt)) onChange(selected.filter((v) => v !== opt));
        else onChange([...selected, opt]);
      };
      return (
        <div className="space-y-2">
          {(question.options as string[]).map((opt) => {
            const checked = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[8px] border text-sm transition-colors text-left ${
                  checked
                    ? "border-[#111111] bg-[#111111] text-white"
                    : "border-[#EAEAEA] bg-white text-[#2F3437] hover:border-[#111111]"
                }`}
              >
                <span className={`w-4 h-4 rounded-[4px] border-2 shrink-0 flex items-center justify-center ${
                  checked ? "border-white" : "border-[#EAEAEA]"
                }`}>
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    case "rating": {
      const rating = (value as number) || 0;
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className="flex-1 group"
            >
              <Star
                className={`w-8 h-8 mx-auto transition-colors ${
                  n <= rating ? "fill-[#956400] text-[#956400]" : "text-[#EAEAEA] group-hover:text-[#956400]"
                }`}
              />
            </button>
          ))}
        </div>
      );
    }

    default:
      return (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );
  }
}

// ── Answer to API payload converter ──────────────────────────────────────────
function valueToAnswer(type: SurveyQuestion["type"], value: unknown): Record<string, unknown> {
  if (type === "multiple_choice") return { values: value };
  if (type === "yes_no") return { value: value };
  if (type === "rating") return { value: Number(value) };
  return { value: String(value ?? "") };
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PublicSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SurveyWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [respondentPhone, setRespondentPhone] = useState("");
  const [respondentName, setRespondentName] = useState("");
  const [ward, setWard] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    fetch(`/api/surveys/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        // d is the analytics shape: { survey, questions, ... }
        setData({ ...d.survey, survey_questions: d.questions || [] });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const setAnswer = useCallback((questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!data) return;

    // Validate required questions
    const questions = data.survey_questions.filter((q) => q.type !== "section_header");
    const missing = questions.filter((q) => {
      if (!q.required) return false;
      const val = answers[q.id];
      if (val === undefined || val === null || val === "") return true;
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    });

    if (missing.length > 0) {
      alert(`Please answer all required questions. Missing: ${missing[0].question}`);
      return;
    }

    const payload: SubmitResponsePayload = {
      respondent_phone: respondentPhone || undefined,
      respondent_name: respondentName || undefined,
      ward: ward || undefined,
      answers: questions.map((q) => ({
        question_id: q.id,
        answer: valueToAnswer(q.type, answers[q.id]),
      })),
    };

    setSubmitting(true);
    try {
      const res = await fetch(`/api/surveys/${id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 202) {
        // Offline — queued
        setSavedOffline(true);
        setSubmitted(true);
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }

      setSubmitted(true);
    } catch {
      // Offline fallback
      try {
        await queueSurveyResponse(id, payload);
        setSavedOffline(true);
        setSubmitted(true);
      } catch {
        alert("Failed to submit. Please check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[#787774]" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-4">
        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-8 max-w-md w-full text-center">
          <AlertCircle className="h-8 w-8 text-[#9F2F2D] mx-auto mb-3" />
          <h2 className="text-[#111111] font-semibold mb-1">Survey unavailable</h2>
          <p className="text-[#787774] text-sm">{error || "This survey could not be loaded."}</p>
        </div>
      </div>
    );
  }

  // ── Not active ────────────────────────────────────────────────────────────
  if (data.status !== "active") {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-4">
        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-8 max-w-md w-full text-center">
          <AlertCircle className="h-8 w-8 text-[#956400] mx-auto mb-3" />
          <h2 className="text-[#111111] font-semibold mb-1">Survey closed</h2>
          <p className="text-[#787774] text-sm">This survey is no longer accepting responses.</p>
        </div>
      </div>
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-4">
        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-[#EDF3EC] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-7 w-7 text-[#346538]" />
          </div>
          <h2 className="text-[#111111] text-xl font-semibold mb-2">
            {savedOffline ? "Response saved" : "Response submitted"}
          </h2>
          <p className="text-[#787774] text-sm leading-relaxed">
            {savedOffline
              ? "You are currently offline. Your response has been saved and will be submitted automatically when you reconnect."
              : "Your response has been recorded. Thank you for participating in this survey."}
          </p>
          {savedOffline && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#956400] bg-[#FBF3DB] px-4 py-2 rounded-[8px]">
              <WifiOff className="h-3.5 w-3.5" />
              Will sync when online
            </div>
          )}
        </div>
      </div>
    );
  }

  const questions = data.survey_questions;
  const WARDS = ["Karandi", "Mirangine", "Gathanji", "Gatimu", "Rurii"];

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F6F3] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-3">

        {/* Offline banner */}
        {!isOnline && (
          <div className="flex items-center gap-2 px-4 py-3 bg-[#FBF3DB] border border-[#E8D9A0] rounded-[8px] text-xs text-[#956400]">
            <WifiOff className="h-3.5 w-3.5 shrink-0" />
            You are offline. Responses will be saved and synced when you reconnect.
          </div>
        )}

        {/* Survey header */}
        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#787774] px-2 py-0.5 rounded-full bg-[#F7F6F3] border border-[#EAEAEA]">
              {data.survey_type.replace(/_/g, " ")}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#346538] px-2 py-0.5 rounded-full bg-[#EDF3EC] border border-[#C8E0C9]">
              Active
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#111111] tracking-tight">{data.title}</h1>
          {data.description && (
            <p className="text-[#787774] text-sm mt-2 leading-relaxed">{data.description}</p>
          )}
          <div className="mt-4 pt-4 border-t border-[#EAEAEA] text-xs text-[#787774]">
            {questions.filter((q) => q.type !== "section_header").length} questions
            {data.closes_at && (
              <> &middot; Closes {new Date(data.closes_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</>
            )}
          </div>
        </div>

        {/* Respondent info */}
        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#787774] mb-4">About you (optional)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#787774] mb-1.5">Full name</label>
              <input
                type="text"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-[8px] border border-[#EAEAEA] bg-white text-[#111111] text-sm focus:outline-none focus:border-[#111111] transition-colors placeholder:text-[#B0ADAA]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#787774] mb-1.5">Phone number</label>
              <input
                type="tel"
                value={respondentPhone}
                onChange={(e) => setRespondentPhone(e.target.value)}
                placeholder="07xxxxxxxx"
                className="w-full px-4 py-3 rounded-[8px] border border-[#EAEAEA] bg-white text-[#111111] text-sm focus:outline-none focus:border-[#111111] transition-colors placeholder:text-[#B0ADAA]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-[#787774] mb-1.5">Ward</label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-4 py-3 rounded-[8px] border border-[#EAEAEA] bg-white text-[#111111] text-sm focus:outline-none focus:border-[#111111] transition-colors cursor-pointer"
              >
                <option value="">Select your ward…</option>
                {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {questions.map((q, i) => {
            if (q.type === "section_header") {
              return (
                <div key={q.id} className="pt-4 pb-1">
                  <QuestionInput question={q} value={undefined} onChange={() => {}} />
                </div>
              );
            }

            const questionNumber = questions
              .filter((qq) => qq.type !== "section_header")
              .findIndex((qq) => qq.id === q.id) + 1;

            return (
              <div key={q.id} className="bg-white border border-[#EAEAEA] rounded-[12px] p-6">
                <div className="mb-4">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#787774] mt-0.5">{questionNumber}.</span>
                    <h3 className="text-sm font-medium text-[#111111] leading-snug">
                      {q.question}
                      {q.required && <span className="text-[#9F2F2D] ml-1">*</span>}
                    </h3>
                  </div>
                  {q.help_text && (
                    <p className="text-xs text-[#787774] ml-4 mt-1">{q.help_text}</p>
                  )}
                </div>
                <QuestionInput
                  question={q}
                  value={answers[q.id]}
                  onChange={(val) => setAnswer(q.id, val)}
                />
              </div>
            );
          })}

          {/* Submit */}
          <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 flex items-center justify-between">
            <p className="text-xs text-[#787774]">
              {Object.keys(answers).length} of{" "}
              {questions.filter((q) => q.type !== "section_header" && q.required).length} required answered
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white text-sm font-medium rounded-[6px] hover:bg-[#333333] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                <><Send className="h-4 w-4" /> Submit response</>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-[10px] text-[#B0ADAA] uppercase tracking-widest">Powered by VoterCore</p>
        </div>
      </div>
    </div>
  );
}

