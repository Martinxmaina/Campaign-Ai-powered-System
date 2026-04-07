"use client";

import { useEffect, useState } from "react";
import { HeartPulse, ThumbsUp, ThumbsDown, Minus, MapPin, RefreshCw, BarChart3, FileText } from "lucide-react";
import { getSentimentBreakdown, getHeatmapData, type ConstituencyHeatmapData, type SentimentBreakdown } from "@/lib/supabase/queries";
import dynamic from "next/dynamic";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from "recharts";
const NyandaruaHeatmap = dynamic(() => import("@/components/dashboard/NyandaruaHeatmap"), { ssr: false });
import { createClient } from "@/utils/supabase/client";

interface PlatformData { platform: string; positive: number; negative: number; neutral: number }
interface WardMood { ward: string; avgMood: number; count: number }
interface IntelType { type: string; count: number }
interface PriorityDist { priority: string; count: number }
interface CandidateMention { name: string; count: number }

export default function SentimentPage() {
    const [sentiment, setSentiment] = useState<SentimentBreakdown>({ positive: 0, neutral: 0, negative: 0, total: 0 });
    const [heatmap, setHeatmap] = useState<ConstituencyHeatmapData[]>([]);
    const [platformData, setPlatformData] = useState<PlatformData[]>([]);
    const [wardMoods, setWardMoods] = useState<WardMood[]>([]);
    const [intelTypes, setIntelTypes] = useState<IntelType[]>([]);
    const [priorities, setPriorities] = useState<PriorityDist[]>([]);
    const [candidateMentions, setCandidateMentions] = useState<CandidateMention[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        Promise.all([
            getSentimentBreakdown(168),
            getHeatmapData(),
            supabase
                .from("analyzed_posts")
                .select("sentiment, raw_posts(platform)")
                .gte("analyzed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
            // Field reports for ward mood, type breakdown, priority, candidate mentions
            supabase
                .from("field_reports")
                .select("ward, mood_score, report_type, priority, candidate_id, notes")
                .order("created_at", { ascending: false })
                .limit(500),
            // Candidates for name lookup
            supabase
                .from("candidates")
                .select("id, name"),
        ]).then(([s, h, postsRes, reportsRes, candidatesRes]) => {
            setSentiment(s);
            setHeatmap(h);

            // Platform breakdown
            const posts = (postsRes.data ?? []) as { sentiment: string | null; raw_posts: { platform: string | null } | null }[];
            const byPlatform: Record<string, PlatformData> = {};
            for (const p of posts) {
                const platform = p.raw_posts?.platform ?? "unknown";
                if (!byPlatform[platform]) byPlatform[platform] = { platform, positive: 0, negative: 0, neutral: 0 };
                if (p.sentiment === "positive") byPlatform[platform].positive++;
                else if (p.sentiment === "negative") byPlatform[platform].negative++;
                else byPlatform[platform].neutral++;
            }
            setPlatformData(Object.values(byPlatform).sort((a, b) => (b.positive + b.negative + b.neutral) - (a.positive + a.negative + a.neutral)));

            // Field reports breakdown
            const reports = (reportsRes.data ?? []) as Record<string, unknown>[];
            const candidateMap: Record<string, string> = {};
            for (const c of (candidatesRes.data ?? []) as Record<string, string>[]) {
                candidateMap[c.id] = c.name;
            }

            // Ward mood averages
            const wardMap: Record<string, { sum: number; count: number }> = {};
            for (const r of reports) {
                const w = (r.ward as string) || "Unknown";
                const mood = Number(r.mood_score) || 0;
                if (!wardMap[w]) wardMap[w] = { sum: 0, count: 0 };
                if (mood > 0) { wardMap[w].sum += mood; wardMap[w].count++; }
            }
            setWardMoods(
                Object.entries(wardMap)
                    .map(([ward, { sum, count }]) => ({ ward, avgMood: count > 0 ? Math.round((sum / count) * 10) / 10 : 0, count }))
                    .filter((w) => w.count > 0)
                    .sort((a, b) => b.avgMood - a.avgMood)
            );

            // Intel type distribution
            const typeMap: Record<string, number> = {};
            for (const r of reports) {
                const t = ((r.report_type as string) || "unknown").replace(/_/g, " ");
                typeMap[t] = (typeMap[t] || 0) + 1;
            }
            setIntelTypes(Object.entries(typeMap).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count));

            // Priority distribution
            const priMap: Record<string, number> = {};
            for (const r of reports) {
                const p = (r.priority as string) || "normal";
                priMap[p] = (priMap[p] || 0) + 1;
            }
            const priOrder = ["critical", "high", "normal", "low"];
            setPriorities(priOrder.filter((p) => priMap[p]).map((priority) => ({ priority, count: priMap[priority] })));

            // Candidate mentions in field reports
            const mentionMap: Record<string, number> = {};
            for (const r of reports) {
                const cid = r.candidate_id as string | null;
                if (cid && candidateMap[cid]) {
                    const name = candidateMap[cid].split(" ").slice(-1)[0];
                    mentionMap[name] = (mentionMap[name] || 0) + 1;
                }
            }
            setCandidateMentions(Object.entries(mentionMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const positivePct = sentiment.total > 0 ? Math.round((sentiment.positive / sentiment.total) * 100) : 0;
    const neutralPct  = sentiment.total > 0 ? Math.round((sentiment.neutral  / sentiment.total) * 100) : 0;
    const negativePct = sentiment.total > 0 ? Math.round((sentiment.negative / sentiment.total) * 100) : 0;

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-pink-50 rounded-lg"><HeartPulse className="h-4 w-4 text-pink-600" /></div>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-900">Sentiment Overview</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Live voter sentiment from social media and field reports.</p>
                    </div>
                </div>
                {loading && <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />}
            </div>

            {/* Overall stats + Pie chart */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Stat cards */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-[12px] border border-[#EAEAEA] text-center">
                        <ThumbsUp className="h-6 w-6 text-[#346538] mx-auto mb-2" />
                        <h3 className="text-3xl font-bold text-[#346538]">{positivePct}%</h3>
                        <p className="text-sm text-[#787774] font-medium mt-1">Positive</p>
                        <p className="text-xs text-[#B0ADAA] mt-0.5">{sentiment.positive.toLocaleString()} posts</p>
                    </div>
                    <div className="bg-white p-6 rounded-[12px] border border-[#EAEAEA] text-center">
                        <Minus className="h-6 w-6 text-[#956400] mx-auto mb-2" />
                        <h3 className="text-3xl font-bold text-[#956400]">{neutralPct}%</h3>
                        <p className="text-sm text-[#787774] font-medium mt-1">Neutral</p>
                        <p className="text-xs text-[#B0ADAA] mt-0.5">{sentiment.neutral.toLocaleString()} posts</p>
                    </div>
                    <div className="bg-white p-6 rounded-[12px] border border-[#EAEAEA] text-center">
                        <ThumbsDown className="h-6 w-6 text-[#9F2F2D] mx-auto mb-2" />
                        <h3 className="text-3xl font-bold text-[#9F2F2D]">{negativePct}%</h3>
                        <p className="text-sm text-[#787774] font-medium mt-1">Negative</p>
                        <p className="text-xs text-[#B0ADAA] mt-0.5">{sentiment.negative.toLocaleString()} posts</p>
                    </div>
                </div>

                {/* Pie chart */}
                <div className="bg-white p-5 rounded-[12px] border border-[#EAEAEA] flex flex-col items-center justify-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#787774] mb-3">Distribution</p>
                    {sentiment.total === 0 ? (
                        <p className="text-xs text-[#B0ADAA] text-center">No data yet</p>
                    ) : (
                        <>
                            <div className="h-36 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Positive", value: sentiment.positive },
                                                { name: "Neutral",  value: sentiment.neutral },
                                                { name: "Negative", value: sentiment.negative },
                                            ]}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={58}
                                            innerRadius={28}
                                            paddingAngle={2}
                                        >
                                            <Cell fill="#346538" />
                                            <Cell fill="#956400" />
                                            <Cell fill="#9F2F2D" />
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ fontSize: 11, border: "1px solid #EAEAEA", borderRadius: 6, boxShadow: "none" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                {[
                                    { label: "Pos", color: "#346538" },
                                    { label: "Neu", color: "#956400" },
                                    { label: "Neg", color: "#9F2F2D" },
                                ].map((l) => (
                                    <div key={l.label} className="flex items-center gap-1 text-[10px] text-[#787774]">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                                        {l.label}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Constituency breakdown from field reports */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            Mood by Constituency
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Based on field report mood scores (1–5)</p>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {heatmap.length === 0 ? (
                            <div className="px-6 py-8 text-center text-xs text-slate-400">
                                No field reports yet. Constituency mood will appear as agents submit reports.
                            </div>
                        ) : (
                            heatmap.map((c) => {
                                const moodPct = c.avgMood > 0 ? Math.round((c.avgMood / 5) * 100) : 0;
                                const posPct = c.reportCount > 0 ? Math.round((c.positiveReports / c.reportCount) * 100) : 0;
                                const negPct = c.reportCount > 0 ? Math.round((c.alertReports / c.reportCount) * 100) : 0;
                                const neuPct = Math.max(0, 100 - posPct - negPct);
                                return (
                                    <div key={c.constituency} className="px-6 py-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-sm font-semibold text-slate-900">{c.constituency}</p>
                                            <span className="text-xs text-slate-400">{c.reportCount} reports</span>
                                        </div>
                                        <div className="flex h-2 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 transition-all" style={{ width: `${posPct}%` }} />
                                            <div className="bg-amber-400 transition-all" style={{ width: `${neuPct}%` }} />
                                            <div className="bg-red-500 transition-all" style={{ width: `${negPct}%` }} />
                                        </div>
                                        <div className="flex items-center justify-between mt-1.5 text-[10px] font-medium">
                                            <span className="text-emerald-600">{posPct}% positive</span>
                                            <span className="text-slate-500">Mood: {c.avgMood > 0 ? c.avgMood.toFixed(1) : "—"}/5</span>
                                            <span className="text-red-500">{negPct}% alerts</span>
                                        </div>
                                        {c.reportCount > 0 && (
                                            <div className="mt-1 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${moodPct}%` }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Social media overall breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-900">Social Media Analysis</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Last 7 days · {sentiment.total} posts analyzed</p>
                    </div>
                    <div className="p-6 space-y-5">
                        {sentiment.total === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-8">
                                No analyzed posts yet. Run the ingestion pipeline to populate this data.
                            </p>
                        ) : (
                            <>
                                {[
                                    { label: "Positive sentiment", pct: positivePct, count: sentiment.positive, color: "bg-emerald-500" },
                                    { label: "Neutral sentiment", pct: neutralPct, count: sentiment.neutral, color: "bg-amber-400" },
                                    { label: "Negative sentiment", pct: negativePct, count: sentiment.negative, color: "bg-red-500" },
                                ].map(({ label, pct, count, color }) => (
                                    <div key={label}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-medium text-slate-700">{label}</span>
                                            <span className="text-sm font-bold text-slate-900">{pct}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{count.toLocaleString()} posts</p>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-slate-100">
                                    <p className="text-xs font-semibold text-slate-700">Total analyzed: {sentiment.total.toLocaleString()} posts</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">From all platforms in the last 7 days</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Platform Breakdown — Stacked Bar */}
            {platformData.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-slate-900">Sentiment by Platform — Last 7 Days</h3>
                    </div>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platformData} margin={{ left: -8, right: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip contentStyle={{ fontSize: 12 }} />
                                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="positive" name="Positive" stackId="a" fill="#22c55e" />
                                <Bar dataKey="neutral"  name="Neutral"  stackId="a" fill="#94a3b8" />
                                <Bar dataKey="negative" name="Negative" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ── Field Report Intelligence ─────────────────────────────────────────── */}
            {(wardMoods.length > 0 || intelTypes.length > 0 || priorities.length > 0 || candidateMentions.length > 0) && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#787774]" />
                        <h3 className="text-sm font-semibold text-[#111111]">Field Report Intelligence</h3>
                        <span className="text-xs text-[#787774]">From field agents across all wards</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Ward Mood Bar Chart */}
                        {wardMoods.length > 0 && (
                            <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5">
                                <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#787774] mb-4">Mood by Ward (avg 1–5)</h4>
                                <div className="h-44">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={wardMoods} margin={{ left: 0, right: 16 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F1" horizontal={false} />
                                            <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10, fill: "#B0ADAA" }} tickCount={6} />
                                            <YAxis type="category" dataKey="ward" tick={{ fontSize: 10, fill: "#B0ADAA" }} width={64} />
                                            <Tooltip
                                                formatter={(v) => [`${v}/5`, "Avg Mood"]}
                                                contentStyle={{ fontSize: 11, border: "1px solid #EAEAEA", borderRadius: 6, boxShadow: "none" }}
                                                cursor={{ fill: "rgba(0,0,0,0.02)" }}
                                            />
                                            <Bar dataKey="avgMood" name="Avg Mood" radius={[0, 3, 3, 0]}>
                                                {wardMoods.map((w, i) => (
                                                    <Cell
                                                        key={i}
                                                        fill={w.avgMood >= 4 ? "#346538" : w.avgMood >= 3 ? "#956400" : "#9F2F2D"}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Intel Type Pie */}
                        {intelTypes.length > 0 && (
                            <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5">
                                <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#787774] mb-4">Report Type Distribution</h4>
                                <div className="flex items-start gap-4">
                                    <div className="h-40 flex-1">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={intelTypes}
                                                    dataKey="count"
                                                    nameKey="type"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={60}
                                                    innerRadius={30}
                                                >
                                                    {intelTypes.map((_, i) => {
                                                        const COLORS = ["#111111", "#787774", "#B0ADAA", "#346538", "#956400", "#1F6C9F", "#9F2F2D"];
                                                        return <Cell key={i} fill={COLORS[i % COLORS.length]} />;
                                                    })}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ fontSize: 11, border: "1px solid #EAEAEA", borderRadius: 6, boxShadow: "none" }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-1.5 pt-2">
                                        {intelTypes.slice(0, 6).map((t, i) => {
                                            const COLORS = ["#111111", "#787774", "#B0ADAA", "#346538", "#956400", "#1F6C9F", "#9F2F2D"];
                                            return (
                                                <div key={t.type} className="flex items-center gap-2 text-xs">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                    <span className="text-[#2F3437] capitalize">{t.type}</span>
                                                    <span className="text-[#787774] ml-1">{t.count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Priority Distribution */}
                        {priorities.length > 0 && (
                            <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5">
                                <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#787774] mb-4">Report Priority Distribution</h4>
                                <div className="h-44">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={priorities} margin={{ left: -8, right: 8 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F1" />
                                            <XAxis dataKey="priority" tick={{ fontSize: 10, fill: "#B0ADAA" }} />
                                            <YAxis tick={{ fontSize: 10, fill: "#B0ADAA" }} allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{ fontSize: 11, border: "1px solid #EAEAEA", borderRadius: 6, boxShadow: "none" }}
                                                cursor={{ fill: "rgba(0,0,0,0.02)" }}
                                            />
                                            <Bar dataKey="count" name="Reports" radius={[3, 3, 0, 0]}>
                                                {priorities.map((p, i) => {
                                                    const fill = p.priority === "critical" ? "#9F2F2D" : p.priority === "high" ? "#956400" : p.priority === "normal" ? "#111111" : "#B0ADAA";
                                                    return <Cell key={i} fill={fill} />;
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Candidate Mentions from Field Reports */}
                        {candidateMentions.length > 0 && (
                            <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5">
                                <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#787774] mb-4">Candidate Mentions in Field Reports</h4>
                                <div className="h-44">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={candidateMentions} margin={{ left: 0, right: 16 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F1" horizontal={false} />
                                            <XAxis type="number" tick={{ fontSize: 10, fill: "#B0ADAA" }} allowDecimals={false} />
                                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#B0ADAA" }} width={64} />
                                            <Tooltip
                                                contentStyle={{ fontSize: 11, border: "1px solid #EAEAEA", borderRadius: 6, boxShadow: "none" }}
                                                cursor={{ fill: "rgba(0,0,0,0.02)" }}
                                            />
                                            <Bar dataKey="count" name="Mentions" fill="#111111" radius={[0, 3, 3, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Nyandarua County Heatmap */}
            <NyandaruaHeatmap height={360} showLegend={true} />
        </div>
    );
}
