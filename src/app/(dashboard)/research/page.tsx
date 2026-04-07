"use client";

import { useEffect, useState } from "react";
import { Download, LineChart, FileText, RefreshCw, FlaskConical } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { FieldReport } from "@/lib/supabase/queries";

interface InsightRow {
    id: string;
    title: string;
    type: string;
    ward: string | null;
    sentiment: string | null;
    analyzedAt: string | null;
}

function timeAgo(iso: string | null) {
    if (!iso) return "Unknown";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function ResearchPage() {
    const [insights, setInsights] = useState<InsightRow[]>([]);
    const [totalPosts, setTotalPosts] = useState(0);
    const [totalFieldReports, setTotalFieldReports] = useState(0);
    const [uniqueTopics, setUniqueTopics] = useState(0);
    const [wardCoverage, setWardCoverage] = useState<{ ward: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        Promise.all([
            supabase.from("analyzed_posts")
                .select("id, key_insight, intent, sentiment, analyzed_at, candidates_mentioned")
                .not("key_insight", "is", null)
                .order("analyzed_at", { ascending: false })
                .limit(25),
            supabase.from("analyzed_posts")
                .select("id", { count: "exact", head: true }),
            supabase.from("field_reports")
                .select("ward", { count: "exact" })
                .order("created_at", { ascending: false }),
        ]).then(([posts, postCount, fieldReports]) => {
            type PostRow = { id: string; key_insight: string | null; intent: string | null; sentiment: string | null; analyzed_at: string | null; candidates_mentioned: string[] | null };
            const postData = (posts.data ?? []) as PostRow[];

            // Build insight rows from analyzed posts
            const rows: InsightRow[] = postData.map((p, i) => ({
                id: `INS-${String(i + 1).padStart(3, "0")}`,
                title: p.key_insight ?? "Untitled insight",
                type: p.intent ? `${p.intent}` : "General analysis",
                ward: (p.candidates_mentioned ?? []).join(", ") || null,
                sentiment: p.sentiment,
                analyzedAt: p.analyzed_at ?? null,
            }));

            // Unique topics
            const topics = new Set(postData.map(p => p.intent).filter(Boolean));

            // Ward coverage from field reports
            const wardMap = new Map<string, number>();
            for (const r of (fieldReports.data ?? []) as FieldReport[]) {
                if (r.ward) {
                    wardMap.set(r.ward, (wardMap.get(r.ward) ?? 0) + 1);
                }
            }
            const coverage = Array.from(wardMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([ward, count]) => ({ ward, count }));

            setInsights(rows);
            setTotalPosts(postCount.count ?? 0);
            setTotalFieldReports(fieldReports.count ?? 0);
            setUniqueTopics(topics.size);
            setWardCoverage(coverage);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const maxWardCount = wardCoverage.length > 0 ? Math.max(...wardCoverage.map(w => w.count)) : 1;

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-900">Research Team Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        AI-analyzed insights, field report coverage, and research deliverables.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {loading && <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />}
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-700">
                        <Download className="h-4 w-4" /> Export research pack
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Posts analyzed</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{totalPosts.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-0.5">From all monitored platforms</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Field reports</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{totalFieldReports.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Submitted by field agents</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Unique topics</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{uniqueTopics}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Distinct themes identified by AI</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Polling trend placeholder */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Headline polling trend</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Vote intent (%, Nyandarua) – last 8 waves.</p>
                        </div>
                        <LineChart className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="p-6 flex items-center justify-center text-xs text-slate-400 min-h-30">
                        Polling chart — connect a polling data source to populate.
                    </div>
                </div>

                {/* Ward coverage */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-900">Field coverage by ward</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Reports submitted per ward</p>
                    </div>
                    <div className="p-6 space-y-3">
                        {loading ? (
                            <div className="flex justify-center"><RefreshCw className="h-4 w-4 text-slate-300 animate-spin" /></div>
                        ) : wardCoverage.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">No field reports yet.</p>
                        ) : (
                            wardCoverage.map(({ ward, count }) => (
                                <div key={ward}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-slate-700">{ward}</span>
                                        <span className="text-xs font-semibold text-slate-900">{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.round((count / maxWardCount) * 100)}%` }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* AI-generated insights */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">AI-generated insights</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Key findings from the latest analyzed social posts.</p>
                    </div>
                    <FlaskConical className="h-4 w-4 text-slate-400" />
                </div>
                {loading ? (
                    <div className="py-12 flex justify-center"><RefreshCw className="h-5 w-5 text-slate-300 animate-spin" /></div>
                ) : insights.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                        No insights yet. Run the AI analysis pipeline to populate analyzed_posts.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-slate-500">
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Insight</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Topic</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Candidates</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Sentiment</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Analyzed</th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {insights.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <p className="font-medium text-slate-900 text-xs line-clamp-2 max-w-xs">{row.title}</p>
                                            <p className="text-[10px] text-slate-400">{row.id}</p>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-slate-600">{row.type || "—"}</td>
                                        <td className="px-6 py-3 text-xs text-slate-500">{row.ward || "—"}</td>
                                        <td className="px-6 py-3">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                row.sentiment === "positive" ? "bg-emerald-50 text-emerald-700" :
                                                row.sentiment === "negative" ? "bg-red-50 text-red-600" :
                                                "bg-slate-100 text-slate-600"
                                            }`}>{row.sentiment ?? "neutral"}</span>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-slate-500">{timeAgo(row.analyzedAt)}</td>
                                        <td className="px-6 py-3 text-right">
                                            <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">
                                                <FileText className="h-3.5 w-3.5" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
