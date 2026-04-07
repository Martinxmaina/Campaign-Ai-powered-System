"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  ArrowLeft, Download, Users, CheckCircle, TrendingUp, MapPin,
  Star, MessageSquare, BarChart3, Loader2,
} from "lucide-react";
import type { SurveyAnalytics, QuestionStats } from "@/lib/surveys/types";
import { authFetch } from "@/utils/supabase/auth-fetch";

function StarRating({ average }: { average: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-5 w-5 ${n <= Math.round(average) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
        />
      ))}
      <span className="text-sm font-bold text-slate-700 ml-1">{average.toFixed(1)}</span>
    </div>
  );
}

function QuestionCard({ stat }: { stat: QuestionStats }) {
  const isChoice = stat.type === "single_choice" || stat.type === "multiple_choice" || stat.type === "yes_no";
  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900 leading-snug">{stat.question}</p>
          <span className="inline-flex mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">
            {stat.type.replace("_", " ")}
          </span>
        </div>
        <span className="text-xs text-slate-400 ml-4 shrink-0">{stat.total_answers} answers</span>
      </div>

      {isChoice && stat.option_counts && (
        <div className="space-y-2.5">
          {Object.entries(stat.option_counts)
            .sort(([, a], [, b]) => b - a)
            .map(([label, count], i) => {
              const total = Object.values(stat.option_counts!).reduce((s, v) => s + v, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-semibold text-slate-700">{pct}% <span className="text-slate-400 font-normal">({count})</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {stat.type === "rating" && stat.distribution && (
        <div className="space-y-3">
          <StarRating average={stat.average ?? 0} />
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[1, 2, 3, 4, 5].map((v) => ({ label: `${v}★`, count: stat.distribution![v] ?? 0 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {[1, 2, 3, 4, 5].map((v, i) => (
                    <Cell key={v} fill={["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {stat.type === "text" && stat.text_responses && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {stat.text_responses.length === 0 && (
            <p className="text-xs text-slate-400">No text responses yet.</p>
          )}
          {stat.text_responses.map((r, i) => (
            <div key={i} className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-700 leading-relaxed">
              &ldquo;{r}&rdquo;
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function exportCSV(analytics: SurveyAnalytics) {
  const rows: string[] = ["Question,Type,Option/Rating,Count,Percentage"];

  for (const stat of analytics.question_stats) {
    if (stat.option_counts) {
      const total = Object.values(stat.option_counts).reduce((s, v) => s + v, 0);
      for (const [opt, count] of Object.entries(stat.option_counts)) {
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
        rows.push(`"${stat.question.replace(/"/g, '""')}","${stat.type}","${opt}",${count},${pct}%`);
      }
    } else if (stat.type === "rating" && stat.distribution) {
      for (const [stars, count] of Object.entries(stat.distribution)) {
        rows.push(`"${stat.question.replace(/"/g, '""')}","rating","${stars} stars",${count},`);
      }
    } else if (stat.text_responses) {
      for (const r of stat.text_responses) {
        rows.push(`"${stat.question.replace(/"/g, '""')}","text","${r.replace(/"/g, '""')}",,`);
      }
    }
  }

  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `survey-responses-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SurveyResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch(`/api/surveys/${id}/responses`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setAnalytics(d);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-red-600">{error || "Failed to load analytics"}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 hover:underline">Go back</button>
      </div>
    );
  }

  const wardData = Object.entries(analytics.ward_breakdown ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([ward, count]) => ({ ward, count }));

  const stats = [
    { label: "Total Responses", value: analytics.total_responses, icon: Users, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Completed", value: analytics.completed_responses, icon: CheckCircle, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Completion Rate", value: `${analytics.completion_rate}%`, icon: TrendingUp, bg: "bg-violet-50", color: "text-violet-600" },
    { label: "Questions", value: analytics.questions?.length ?? analytics.question_stats.length, icon: BarChart3, bg: "bg-amber-50", color: "text-amber-600" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900">{analytics.survey?.title ?? "Survey Analytics"}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Response analysis</p>
          </div>
        </div>
        <button
          onClick={() => exportCSV(analytics)}
          className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{s.label}</span>
                <div className={`p-2 ${s.bg} ${s.color} rounded-lg`}><Icon className="h-4 w-4" /></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{s.value}</h3>
            </div>
          );
        })}
      </div>

      {/* No responses yet */}
      {analytics.total_responses === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm text-center py-16">
          <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No responses yet.</p>
          <p className="text-xs text-slate-400 mt-1">Share this survey to start collecting data.</p>
        </div>
      )}

      {analytics.total_responses > 0 && (
        <>
          {/* Ward Breakdown */}
          {wardData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900">Responses by Ward</h3>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wardData} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis dataKey="ward" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="count" fill="#2563eb" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Per-question cards */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Question Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {analytics.question_stats.map((stat) => (
                <QuestionCard key={stat.question_id} stat={stat} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
