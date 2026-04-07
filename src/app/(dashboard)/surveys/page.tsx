"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListChecks, Plus, BarChart3, Users, Clock, ChevronRight, CheckCircle, Circle, Loader2, Search, Pause } from "lucide-react";
import type { Survey } from "@/lib/surveys/types";
import { authFetch } from "@/utils/supabase/auth-fetch";

const STATUS_TABS = ["all", "active", "draft", "completed", "paused"] as const;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-600",
  completed: "bg-blue-50 text-blue-600",
  draft: "bg-amber-50 text-amber-600",
  paused: "bg-slate-100 text-slate-500",
  archived: "bg-slate-100 text-slate-400",
};

const TYPE_LABELS: Record<string, string> = {
  voter_priority: "Voter Priority",
  candidate_preference: "Candidate Preference",
  issue_satisfaction: "Issue Satisfaction",
  event_feedback: "Event Feedback",
  custom: "Custom",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle className="h-4 w-4" />;
  if (status === "paused") return <Pause className="h-4 w-4" />;
  return <Circle className="h-4 w-4" />;
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    authFetch("/api/surveys")
      .then((r) => r.json())
      .then((d) => setSurveys(d.surveys || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = surveys.filter((s) => {
    if (activeTab !== "all" && s.status !== activeTab) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalResponses = surveys.reduce((sum, s) => sum + s.response_count, 0);
  const activeCount = surveys.filter((s) => s.status === "active").length;
  const avgCompletion =
    surveys.length > 0
      ? Math.round(surveys.reduce((sum, s) => sum + (s.completion_rate || 0), 0) / surveys.length)
      : 0;

  const stats = [
    { label: "Total Surveys", value: loading ? "—" : String(surveys.length), icon: ListChecks, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Total Responses", value: loading ? "—" : totalResponses.toLocaleString(), icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Active Surveys", value: loading ? "—" : String(activeCount), icon: BarChart3, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { label: "Avg Completion", value: loading ? "—" : `${avgCompletion}%`, icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900">Survey Builder</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create, distribute, and analyze voter surveys.</p>
        </div>
        <Link
          href="/surveys/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> New Survey
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{stat.label}</span>
                <div className={`p-2 ${stat.iconBg} ${stat.iconColor} rounded-lg`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Search surveys..."
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <ListChecks className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-1">
              {surveys.length === 0 ? "No surveys yet" : "No surveys match your filter"}
            </p>
            {surveys.length === 0 && (
              <Link href="/surveys/new" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Create your first survey
              </Link>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="divide-y divide-slate-50">
            {filtered.map((s) => (
              <Link
                key={s.id}
                href={`/surveys/${s.id}`}
                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 cursor-pointer group transition-colors"
              >
                <div className={`shrink-0 p-2 rounded-lg ${STATUS_STYLES[s.status] || "bg-slate-100 text-slate-400"}`}>
                  <StatusIcon status={s.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{s.title}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span>{TYPE_LABELS[s.survey_type] || s.survey_type}</span>
                    <span>{s.question_count} questions</span>
                    <span>{s.response_count.toLocaleString()} responses</span>
                    <span className="hidden sm:inline">{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {s.response_count > 0 && (
                    <div className="hidden items-center gap-2 w-32 sm:flex">
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${s.completion_rate || 0}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{Math.round(s.completion_rate || 0)}%</span>
                    </div>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[s.status] || "bg-slate-100 text-slate-400"}`}>
                    {s.status}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
