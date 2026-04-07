"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Loader2, Save, Send,
  CircleDot, CheckSquare, Star, AlignLeft, ToggleLeft, X, Eye, EyeOff,
  AlignJustify, Hash, Mail, Phone, Calendar, ChevronDown as DropdownIcon,
  Minus, GripVertical, SeparatorHorizontal,
} from "lucide-react";
import Link from "next/link";
import type { QuestionDraft, Survey } from "@/lib/surveys/types";
import { authFetch } from "@/utils/supabase/auth-fetch";

const WARDS = ["Karandi", "Mirangine", "Gathanji", "Gatimu", "Rurii"];
const AGE_GROUPS = ["18-25", "26-35", "36-50", "51+"];
const SUPPORT_LEVELS = ["strong_support", "lean_support", "undecided", "lean_against", "against"];
const CHANNELS = ["sms", "whatsapp", "web", "field_agent"];

const SURVEY_TYPES: { value: Survey["survey_type"]; label: string }[] = [
  { value: "voter_priority", label: "Voter Priority Poll" },
  { value: "candidate_preference", label: "Candidate Preference" },
  { value: "issue_satisfaction", label: "Issue Satisfaction" },
  { value: "event_feedback", label: "Event Feedback" },
  { value: "custom", label: "Custom Survey" },
];

const SUPPORT_LABELS: Record<string, string> = {
  strong_support: "Strong Support", lean_support: "Lean Support", undecided: "Undecided",
  lean_against: "Lean Against", against: "Against",
};
const CHANNEL_LABELS: Record<string, string> = {
  sms: "SMS", whatsapp: "WhatsApp", web: "Web", field_agent: "Field Agent",
};

interface FieldTypeConfig {
  value: QuestionDraft["type"];
  label: string;
  icon: React.ReactNode;
  group: "choice" | "input" | "scale" | "layout";
  hasOptions: boolean;
}

const FIELD_TYPES: FieldTypeConfig[] = [
  { value: "single_choice",  label: "Single Choice",   icon: <CircleDot className="h-4 w-4" />,   group: "choice", hasOptions: true },
  { value: "multiple_choice",label: "Multiple Choice", icon: <CheckSquare className="h-4 w-4" />, group: "choice", hasOptions: true },
  { value: "dropdown",       label: "Dropdown",        icon: <DropdownIcon className="h-4 w-4" />,group: "choice", hasOptions: true },
  { value: "yes_no",         label: "Yes / No",        icon: <ToggleLeft className="h-4 w-4" />,  group: "choice", hasOptions: false },
  { value: "short_text",     label: "Short Text",      icon: <Minus className="h-4 w-4" />,       group: "input",  hasOptions: false },
  { value: "long_text",      label: "Long Text",       icon: <AlignJustify className="h-4 w-4" />,group: "input",  hasOptions: false },
  { value: "text",           label: "Free Text",       icon: <AlignLeft className="h-4 w-4" />,   group: "input",  hasOptions: false },
  { value: "number",         label: "Number",          icon: <Hash className="h-4 w-4" />,        group: "input",  hasOptions: false },
  { value: "email",          label: "Email",           icon: <Mail className="h-4 w-4" />,        group: "input",  hasOptions: false },
  { value: "phone",          label: "Phone",           icon: <Phone className="h-4 w-4" />,       group: "input",  hasOptions: false },
  { value: "date",           label: "Date",            icon: <Calendar className="h-4 w-4" />,    group: "input",  hasOptions: false },
  { value: "rating",         label: "Rating (1–5)",    icon: <Star className="h-4 w-4" />,        group: "scale",  hasOptions: false },
  { value: "section_header", label: "Section Header",  icon: <SeparatorHorizontal className="h-4 w-4" />, group: "layout", hasOptions: false },
];

const FIELD_GROUPS = [
  { key: "choice", label: "Choice" },
  { key: "input",  label: "Input" },
  { key: "scale",  label: "Scale" },
  { key: "layout", label: "Layout" },
] as const;

function fieldConfig(type: QuestionDraft["type"]) {
  return FIELD_TYPES.find((f) => f.value === type) ?? FIELD_TYPES[0];
}

function newQuestion(type: QuestionDraft["type"] = "short_text"): QuestionDraft {
  const cfg = FIELD_TYPES.find((f) => f.value === type)!;
  return {
    tempId: Math.random().toString(36).slice(2),
    question: "",
    helpText: "",
    type,
    options: cfg.hasOptions ? ["", ""] : [],
    required: true,
    placeholder: "",
  };
}

// Preview renderer for each field type
function FieldPreview({ q }: { q: QuestionDraft }) {
  if (q.type === "section_header") {
    return (
      <div className="border-t border-[#EAEAEA] pt-4">
        <p className="text-sm font-semibold text-[#111111]">{q.question || "Section Header"}</p>
        {q.helpText && <p className="text-xs text-[#787774] mt-0.5">{q.helpText}</p>}
      </div>
    );
  }

  const validOptions = q.options.filter(Boolean);
  return (
    <div className="space-y-2">
      {q.type === "single_choice" && validOptions.map((o, i) => (
        <label key={i} className="flex items-center gap-2 text-xs text-[#2F3437]">
          <div className="w-3.5 h-3.5 rounded-full border border-[#EAEAEA]" /> {o}
        </label>
      ))}
      {q.type === "multiple_choice" && validOptions.map((o, i) => (
        <label key={i} className="flex items-center gap-2 text-xs text-[#2F3437]">
          <div className="w-3.5 h-3.5 rounded-[3px] border border-[#EAEAEA]" /> {o}
        </label>
      ))}
      {q.type === "dropdown" && (
        <div className="px-3 py-2 rounded-[6px] border border-[#EAEAEA] bg-[#F7F6F3] text-xs text-[#787774] flex items-center justify-between">
          <span>{validOptions[0] || "Select an option"}</span>
          <DropdownIcon className="h-3 w-3 text-[#787774]" />
        </div>
      )}
      {q.type === "yes_no" && (
        <div className="flex gap-3">
          {["Yes", "No"].map((v) => (
            <label key={v} className="flex items-center gap-1.5 text-xs text-[#2F3437]">
              <div className="w-3.5 h-3.5 rounded-full border border-[#EAEAEA]" /> {v}
            </label>
          ))}
        </div>
      )}
      {q.type === "rating" && (
        <div className="flex gap-1">
          {[1,2,3,4,5].map((n) => (
            <div key={n} className="w-7 h-7 rounded-lg border border-[#EAEAEA] bg-[#F7F6F3] flex items-center justify-center text-xs text-[#787774] font-medium">{n}</div>
          ))}
        </div>
      )}
      {(q.type === "short_text" || q.type === "email" || q.type === "phone" || q.type === "number") && (
        <div className="px-3 py-2 rounded-[6px] border border-[#EAEAEA] bg-[#F7F6F3] text-xs text-[#787774]">
          {q.placeholder || "Short answer"}
        </div>
      )}
      {(q.type === "long_text" || q.type === "text") && (
        <div className="px-3 py-2 rounded-[6px] border border-[#EAEAEA] bg-[#F7F6F3] text-xs text-[#787774] h-14">
          {q.placeholder || "Long answer"}
        </div>
      )}
      {q.type === "date" && (
        <div className="px-3 py-2 rounded-[6px] border border-[#EAEAEA] bg-[#F7F6F3] text-xs text-[#787774] flex items-center gap-2">
          <Calendar className="h-3 w-3" /> DD / MM / YYYY
        </div>
      )}
    </div>
  );
}

export default function NewSurveyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [surveyType, setSurveyType] = useState<Survey["survey_type"]>("custom");
  const [closesAt, setClosesAt] = useState("");
  const [targetWards, setTargetWards] = useState<string[]>([]);
  const [targetAgeGroups, setTargetAgeGroups] = useState<string[]>([]);
  const [targetSupportLevels, setTargetSupportLevels] = useState<string[]>([]);
  const [distribution, setDistribution] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);

  function toggleArrayItem(arr: string[], item: string, setter: (v: string[]) => void) {
    setter(arr.includes(item) ? arr.filter((a) => a !== item) : [...arr, item]);
  }

  function moveQuestion(index: number, direction: "up" | "down") {
    const next = [...questions];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setQuestions(next);
  }

  function updateQuestion(index: number, updates: Partial<QuestionDraft>) {
    const next = [...questions];
    next[index] = { ...next[index], ...updates };
    if (updates.type) {
      const cfg = FIELD_TYPES.find((f) => f.value === updates.type);
      if (cfg?.hasOptions && next[index].options.length < 2) {
        next[index].options = ["", ""];
      } else if (!cfg?.hasOptions) {
        next[index].options = [];
      }
    }
    setQuestions(next);
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    const next = [...questions];
    next[qIndex] = { ...next[qIndex], options: [...next[qIndex].options] };
    next[qIndex].options[oIndex] = value;
    setQuestions(next);
  }

  function addField(type: QuestionDraft["type"]) {
    const q = newQuestion(type);
    setQuestions((prev) => [...prev, q]);
    setActiveField(q.tempId);
  }

  async function handleSave(publish: boolean) {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        survey_type: surveyType,
        target_segment: {
          ...(targetWards.length > 0 ? { wards: targetWards } : {}),
          ...(targetAgeGroups.length > 0 ? { age_groups: targetAgeGroups } : {}),
          ...(targetSupportLevels.length > 0 ? { support_levels: targetSupportLevels } : {}),
        },
        distribution: distribution.length > 0 ? distribution : undefined,
        closes_at: closesAt || undefined,
        questions: questions
          .filter((q) => q.question.trim() || q.type === "section_header")
          .map((q) => ({
            question: q.question.trim(),
            help_text: q.helpText?.trim() || null,
            placeholder: q.placeholder?.trim() || null,
            type: q.type,
            options: q.options.filter((o) => o.trim()),
            required: q.required,
          })),
        publish,
      };
      const res = await authFetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const { survey } = await res.json();
        router.push(`/surveys/${survey.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save survey");
      }
    } catch {
      alert("Failed to save survey");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/surveys" className="p-2 rounded-[6px] hover:bg-white border border-transparent hover:border-[#EAEAEA] transition-all">
            <ArrowLeft className="h-4 w-4 text-[#787774]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-semibold text-[#111111] tracking-tight">New Survey</h1>
            <p className="text-xs text-[#787774] mt-0.5">Build your form, then share the link.</p>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-[#EAEAEA] bg-white text-xs text-[#2F3437] hover:bg-[#F7F6F3] transition-colors lg:hidden"
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Field palette */}
          <div className={`lg:col-span-2 ${showPreview ? "hidden lg:block" : ""}`}>
            <div className="lg:sticky lg:top-6 bg-white border border-[#EAEAEA] rounded-[12px] p-4 space-y-4">
              <p className="text-[11px] font-semibold text-[#787774] uppercase tracking-widest">Field Types</p>
              {FIELD_GROUPS.map((g) => (
                <div key={g.key}>
                  <p className="text-[10px] font-medium text-[#787774] uppercase tracking-wider mb-1.5">{g.label}</p>
                  <div className="space-y-1">
                    {FIELD_TYPES.filter((f) => f.group === g.key).map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => addField(f.value)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[6px] text-xs text-[#2F3437] hover:bg-[#F7F6F3] hover:text-[#111111] transition-colors text-left"
                      >
                        <span className="text-[#787774]">{f.icon}</span>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER: Form canvas */}
          <div className={`lg:col-span-6 space-y-4 ${showPreview ? "hidden lg:block" : ""}`}>
            {/* Survey metadata */}
            <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 space-y-4">
              <div className="space-y-1">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Survey title"
                  className="w-full text-xl font-semibold text-[#111111] placeholder:text-[#EAEAEA] bg-transparent border-none outline-none tracking-tight"
                />
                <div className="h-px bg-[#EAEAEA]" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Survey description (optional)"
                  className="w-full text-sm text-[#787774] placeholder:text-[#EAEAEA] bg-transparent border-none outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EAEAEA]">
                <div>
                  <label className="text-[10px] font-medium text-[#787774] uppercase tracking-wider">Type</label>
                  <select
                    value={surveyType}
                    onChange={(e) => setSurveyType(e.target.value as Survey["survey_type"])}
                    className="mt-1 w-full px-3 py-2 rounded-[6px] border border-[#EAEAEA] text-xs bg-white text-[#2F3437] focus:outline-none focus:border-[#111111]"
                  >
                    {SURVEY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#787774] uppercase tracking-wider">Closes</label>
                  <input
                    type="date"
                    value={closesAt}
                    onChange={(e) => setClosesAt(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-[6px] border border-[#EAEAEA] text-xs bg-white text-[#2F3437] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* Questions canvas */}
            {questions.length === 0 ? (
              <div className="bg-white border border-dashed border-[#EAEAEA] rounded-[12px] p-10 text-center">
                <Plus className="h-6 w-6 text-[#EAEAEA] mx-auto mb-2" />
                <p className="text-sm text-[#787774]">Click a field type to add your first question</p>
                <p className="text-xs text-[#EAEAEA] mt-1">or drag from the palette on the left</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, qi) => {
                  const cfg = fieldConfig(q.type);
                  const isActive = activeField === q.tempId;
                  const isSectionHeader = q.type === "section_header";
                  return (
                    <div
                      key={q.tempId}
                      onClick={() => setActiveField(q.tempId)}
                      className={`bg-white border rounded-[10px] transition-all cursor-pointer ${
                        isActive ? "border-[#111111] shadow-[0_0_0_3px_rgba(17,17,17,0.06)]" : "border-[#EAEAEA] hover:border-[#D0D0D0]"
                      }`}
                    >
                      {/* Card header */}
                      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                        <GripVertical className="h-4 w-4 text-[#EAEAEA] cursor-grab" />
                        <span className="text-[10px] font-medium text-[#787774] flex items-center gap-1.5">
                          {cfg.icon} {cfg.label}
                        </span>
                        <div className="flex-1" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveQuestion(qi, "up"); }} disabled={qi === 0} className="p-0.5 text-[#EAEAEA] hover:text-[#787774] disabled:opacity-20 transition-colors">
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveQuestion(qi, "down"); }} disabled={qi === questions.length - 1} className="p-0.5 text-[#EAEAEA] hover:text-[#787774] disabled:opacity-20 transition-colors">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setQuestions(questions.filter((_, i) => i !== qi)); }} className="p-0.5 text-[#EAEAEA] hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="px-4 pb-4 space-y-3">
                        {/* Question text */}
                        <input
                          value={q.question}
                          onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={isSectionHeader ? "Section title" : "Question text"}
                          className="w-full text-sm font-medium text-[#111111] placeholder:text-[#EAEAEA] bg-transparent border-none outline-none"
                        />

                        {isActive && !isSectionHeader && (
                          <div className="space-y-2 border-t border-[#F7F6F3] pt-2">
                            <input
                              value={q.helpText ?? ""}
                              onChange={(e) => updateQuestion(qi, { helpText: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Help text (optional)"
                              className="w-full text-xs text-[#787774] placeholder:text-[#EAEAEA] bg-transparent border-none outline-none"
                            />
                            {(q.type === "short_text" || q.type === "long_text" || q.type === "text" || q.type === "number" || q.type === "email" || q.type === "phone") && (
                              <input
                                value={q.placeholder ?? ""}
                                onChange={(e) => updateQuestion(qi, { placeholder: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Placeholder text (optional)"
                                className="w-full text-xs text-[#787774] placeholder:text-[#EAEAEA] bg-transparent border-none outline-none"
                              />
                            )}
                          </div>
                        )}

                        {/* Options editor */}
                        {cfg.hasOptions && (
                          <div className="space-y-1.5">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <div className={`w-3 h-3 shrink-0 ${q.type === "single_choice" || q.type === "dropdown" ? "rounded-full" : "rounded-[3px]"} border border-[#EAEAEA]`} />
                                <input
                                  value={opt}
                                  onChange={(e) => updateOption(qi, oi, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder={`Option ${oi + 1}`}
                                  className="flex-1 text-xs text-[#2F3437] placeholder:text-[#EAEAEA] bg-transparent border-none outline-none"
                                />
                                {q.options.length > 2 && (
                                  <button type="button" onClick={(e) => { e.stopPropagation(); const next = [...questions]; next[qi].options = next[qi].options.filter((_, i) => i !== oi); setQuestions(next); }} className="text-[#EAEAEA] hover:text-red-400 transition-colors">
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button type="button" onClick={(e) => { e.stopPropagation(); const next = [...questions]; next[qi].options = [...next[qi].options, ""]; setQuestions(next); }} className="text-xs text-[#787774] hover:text-[#111111] ml-5 transition-colors">
                              + Add option
                            </button>
                          </div>
                        )}

                        {/* Required toggle */}
                        {!isSectionHeader && isActive && (
                          <div className="flex items-center gap-2 pt-1 border-t border-[#F7F6F3]">
                            <label className="flex items-center gap-1.5 text-xs text-[#787774] cursor-pointer select-none">
                              <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(qi, { required: e.target.checked })} className="rounded border-[#EAEAEA] accent-[#111111] w-3 h-3" />
                              Required
                            </label>
                            <div className="flex-1" />
                            <span className="text-[10px] text-[#EAEAEA]">Q{qi + 1}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add field button at bottom */}
                <button
                  type="button"
                  onClick={() => addField("short_text")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] border border-dashed border-[#EAEAEA] text-xs text-[#787774] hover:border-[#111111] hover:text-[#111111] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add field
                </button>
              </div>
            )}

            {/* Target Segment */}
            <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5 space-y-4">
              <p className="text-xs font-semibold text-[#111111] uppercase tracking-wider">Target Segment</p>

              {[
                { label: "Wards", items: WARDS, state: targetWards, setter: setTargetWards },
                { label: "Age Groups", items: AGE_GROUPS, state: targetAgeGroups, setter: setTargetAgeGroups },
              ].map(({ label, items, state, setter }) => (
                <div key={label}>
                  <p className="text-[10px] font-medium text-[#787774] uppercase tracking-wider mb-1.5">{label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <button key={item} type="button" onClick={() => toggleArrayItem(state, item, setter)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase transition-colors ${
                          state.includes(item) ? "bg-[#111111] text-white" : "bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA] hover:border-[#111111]"
                        }`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <p className="text-[10px] font-medium text-[#787774] uppercase tracking-wider mb-1.5">Distribution</p>
                <div className="flex flex-wrap gap-1.5">
                  {CHANNELS.map((c) => (
                    <button key={c} type="button" onClick={() => toggleArrayItem(distribution, c, setDistribution)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase transition-colors ${
                        distribution.includes(c) ? "bg-[#111111] text-white" : "bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA] hover:border-[#111111]"
                      }`}>
                      {CHANNEL_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-medium text-[#787774] uppercase tracking-wider mb-1.5">Support Level</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORT_LEVELS.map((s) => (
                    <button key={s} type="button" onClick={() => toggleArrayItem(targetSupportLevels, s, setTargetSupportLevels)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase transition-colors ${
                        targetSupportLevels.includes(s) ? "bg-[#111111] text-white" : "bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA] hover:border-[#111111]"
                      }`}>
                      {SUPPORT_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Preview + Actions */}
          <div className={`lg:col-span-4 ${showPreview ? "" : "hidden lg:block"}`}>
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Actions */}
              <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-4 space-y-2">
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || !title.trim() || questions.filter(q => q.question.trim() || q.type === "section_header").length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#111111] text-white text-sm font-medium hover:bg-[#333333] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Publish Survey
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving || !title.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] border border-[#EAEAEA] bg-white text-[#2F3437] text-sm font-medium hover:bg-[#F7F6F3] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Save className="h-4 w-4" /> Save as Draft
                </button>
              </div>

              {/* Live Preview */}
              <div className="bg-white border border-[#EAEAEA] rounded-[12px] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#EAEAEA] flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-[#787774]" />
                  <p className="text-xs font-medium text-[#787774]">Live Preview</p>
                </div>
                {/* Faux browser chrome */}
                <div className="bg-[#F7F6F3] px-3 py-2 border-b border-[#EAEAEA] flex items-center gap-1.5">
                  {["bg-red-200", "bg-amber-200", "bg-green-200"].map((c, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />
                  ))}
                </div>
                <div className="p-5 space-y-4 max-h-130 overflow-y-auto">
                  {!title.trim() && questions.length === 0 ? (
                    <p className="text-xs text-[#EAEAEA] text-center py-8">Preview will appear here</p>
                  ) : (
                    <>
                      {title && <h2 className="text-base font-semibold text-[#111111] tracking-tight">{title}</h2>}
                      {description && <p className="text-xs text-[#787774] leading-relaxed">{description}</p>}
                      <div className="space-y-5">
                        {questions.filter((q) => q.question.trim() || q.type === "section_header").map((q, i) => (
                          <div key={q.tempId} className="space-y-2">
                            {q.type !== "section_header" && (
                              <p className="text-xs font-medium text-[#111111]">
                                {i + 1}. {q.question}
                                {q.required && <span className="text-red-400 ml-0.5">*</span>}
                              </p>
                            )}
                            {q.helpText && <p className="text-[10px] text-[#787774]">{q.helpText}</p>}
                            <FieldPreview q={q} />
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-2.5 rounded-[6px] bg-[#111111] text-white text-xs font-medium mt-4 hover:bg-[#333333] transition-colors">
                        Submit
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              {questions.length > 0 && (
                <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-[#787774] uppercase tracking-wider">Fields</p>
                    <p className="text-2xl font-semibold text-[#111111]">{questions.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#787774] uppercase tracking-wider">Required</p>
                    <p className="text-2xl font-semibold text-[#111111]">{questions.filter(q => q.required).length}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
