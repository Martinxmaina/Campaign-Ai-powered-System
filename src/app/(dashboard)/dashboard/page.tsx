"use client";

import { useState, useEffect } from "react";
import {
    Smile, MousePointerClick, Newspaper,
    AlertTriangle, ArrowUpRight, RefreshCw, Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import ElectionCountdown from "@/components/layout/ElectionCountdown";
const NyandaruaHeatmap = dynamic(() => import("@/components/dashboard/NyandaruaHeatmap"), { ssr: false });
import type ExecutiveLineChartType from "@/components/charts/ExecutiveLineChart";
const ExecutiveLineChart = dynamic(() => import("@/components/charts/ExecutiveLineChart"), { ssr: false }) as typeof ExecutiveLineChartType;
import { getDashboardStats, getSentimentBreakdown, getCandidateHistory } from "@/lib/supabase/queries";
import { useCandidateUpdates } from "@/lib/supabase/realtime";
import type { DashboardStats } from "@/lib/supabase/queries";
import type { Candidate, WarRoomAlert } from "@/lib/supabase/queries";
import { createClient } from "@/utils/supabase/client";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [chartPeriod, setChartPeriod] = useState<"weekly" | "monthly">("monthly");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [sentiment, setSentiment] = useState({ positive: 0, negative: 0, neutral: 0, total: 0 });
    const [recentAlerts, setRecentAlerts] = useState<WarRoomAlert[]>([]);
    const [historyData, setHistoryData] = useState<{ label: string; value: number }[]>([]);
    const [activeActivity, setActiveActivity] = useState<number | null>(null);

    const candidates = useCandidateUpdates(stats?.candidates ?? []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dashStats, sentimentData] = await Promise.all([
                getDashboardStats(),
                getSentimentBreakdown(24),
            ]);
            setStats(dashStats);
            setSentiment(sentimentData);

            // Fetch recent alerts for activity feed
            const supabase = createClient();
            const { data: alerts } = await supabase
                .from("war_room_alerts")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(5);
            setRecentAlerts(alerts ?? []);

            // Fetch history for our candidate chart
            if (dashStats.candidates.length > 0) {
                const ourCandidate = dashStats.candidates.find((c) => c.is_our_candidate) ?? dashStats.candidates[0];
                const history = await getCandidateHistory(ourCandidate.id, chartPeriod === "weekly" ? 105 : 30);
                setHistoryData(
                    history.map((h, i) => ({
                        label: chartPeriod === "weekly" ? `W${i + 1}` : `D${i + 1}`,
                        value: Number(h.sentiment_positive ?? 0),
                    }))
                );
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartPeriod]);

    const positivePct = sentiment.total > 0 ? Math.round((sentiment.positive / sentiment.total) * 100) : 0;

    const statCards = [
        { label: "Voter Sentiment", value: `${positivePct}%`, change: `${sentiment.total} posts`, icon: Smile, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Active Alerts", value: String(stats?.activeAlerts ?? 0), change: "war room", icon: AlertTriangle, iconBg: "bg-amber-50", iconColor: "text-amber-600", neutral: true },
        { label: "Posts Analyzed", value: String(stats?.totalPosts ?? 0), change: "all platforms", icon: Newspaper, iconBg: "bg-violet-50", iconColor: "text-violet-600", neutral: true },
        { label: "Voter Contacts", value: String(stats?.totalVoterContacts ?? 0), change: `${stats?.totalFieldReports ?? 0} field reports`, icon: MousePointerClick, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", neutral: true },
    ];

    const severityIcon: Record<string, { iconBg: string; iconColor: string }> = {
        critical: { iconBg: "bg-red-50", iconColor: "text-red-600" },
        high: { iconBg: "bg-amber-50", iconColor: "text-amber-600" },
        medium: { iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        info: { iconBg: "bg-slate-50", iconColor: "text-slate-600" },
    };

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Page Title */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-900">Campaign Overview</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Real-time campaign performance — Ol Kalou 2026</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            {/* Election Countdown */}
            <ElectionCountdown mode="full" />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="stat-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{stat.label}</span>
                                <div className={`p-2 ${stat.iconBg} ${stat.iconColor} rounded-lg`}><Icon className="h-4 w-4" /></div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                <span className={`text-xs font-medium ${stat.neutral ? "text-slate-400" : "text-emerald-600 flex items-center gap-0.5"}`}>
                                    {!stat.neutral && <ArrowUpRight className="h-3 w-3" />}
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Candidate Standings */}
            {candidates.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Candidate Win Probability</h3>
                    <div className="space-y-3">
                        {candidates.map((c) => {
                            const color = c.is_our_candidate ? "bg-blue-600" : c.threat_level === "high" ? "bg-red-500" : "bg-slate-400";
                            return (
                                <div key={c.id} className="group">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-medium text-slate-700">
                                            {c.name} {c.party && `(${c.party})`}
                                            {c.is_our_candidate && <span className="ml-1 text-blue-600 font-semibold">★</span>}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${c.momentum === "rising" ? "bg-emerald-50 text-emerald-600" : c.momentum === "declining" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                                                {c.momentum}
                                            </span>
                                            <span className={`font-bold px-1.5 py-0.5 rounded text-white text-[10px] ${color}`}>{c.win_prob}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${c.win_prob}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Candidate Performance Bar Chart */}
            {candidates.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Candidate Win Probability — All Candidates</h3>
                    <p className="text-xs text-slate-400 mb-4">Blue = our candidate · Red = high threat · Gray = others</p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={[...candidates].sort((a, b) => (b.win_prob ?? 0) - (a.win_prob ?? 0)).map((c) => ({
                                    name: c.name.split(" ").slice(-1)[0],
                                    win_prob: c.win_prob ?? 0,
                                    fill: c.is_our_candidate ? "#2563eb" : c.threat_level === "high" || c.threat_level === "critical" ? "#ef4444" : "#94a3b8",
                                }))}
                                margin={{ left: 8, right: 24, top: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 50]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={64} />
                                <Tooltip formatter={(v) => [`${v}%`, "Win probability"]} contentStyle={{ fontSize: 12 }} />
                                <Bar dataKey="win_prob" radius={[0, 3, 3, 0]}>
                                    {[...candidates].sort((a, b) => (b.win_prob ?? 0) - (a.win_prob ?? 0)).map((c, i) => (
                                        <Cell key={i} fill={c.is_our_candidate ? "#2563eb" : c.threat_level === "high" || c.threat_level === "critical" ? "#ef4444" : "#94a3b8"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Sentiment Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Voter Sentiment Trends</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Positive sentiment % over time</p>
                    </div>
                    <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-lg">
                        {(["weekly", "monthly"] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setChartPeriod(p)}
                                className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all capitalize ${chartPeriod === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-52 w-full">
                    {historyData.length > 0 ? (
                        <ExecutiveLineChart
                            title=""
                            subtitle={chartPeriod === "weekly" ? "Last 15 weeks" : "Last 30 days"}
                            data={historyData}
                            xKey="label"
                            series={[{ dataKey: "value", label: "Positive sentiment (%)", color: "#2563eb" }]}
                            showHeader={false}
                            showLegend={false}
                            height={208}
                            xTickInterval={chartPeriod === "monthly" ? 4 : "preserveStartEnd"}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-sm text-slate-400">
                            {loading ? "Loading chart data..." : "No sentiment history data yet. Data will appear once posts are analyzed."}
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kenya Heatmap */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">Ol Kalou Ward Support</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Based on field reports and social sentiment</p>
                    </div>
                    <NyandaruaHeatmap />
                </div>

                {/* Activity Feed — from war_room_alerts */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Recent Alerts</h3>
                            <p className="text-xs text-slate-400 mt-0.5">War Room feed</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {recentAlerts.length === 0 && !loading && (
                            <p className="text-sm text-slate-400 text-center py-8">No recent alerts.</p>
                        )}
                        {recentAlerts.map((alert, i) => {
                            const sv = severityIcon[alert.severity ?? "info"] ?? severityIcon.info;
                            const isActive = activeActivity === i;
                            return (
                                <div
                                    key={alert.id}
                                    onClick={() => setActiveActivity(isActive ? null : i)}
                                    className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isActive ? "border-blue-200 bg-blue-50" : "border-transparent hover:border-slate-100 hover:bg-slate-50"}`}
                                >
                                    <div className={`shrink-0 w-9 h-9 rounded-lg ${sv.iconBg} flex items-center justify-center ${sv.iconColor}`}>
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-slate-900">{alert.severity?.toUpperCase()}</p>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${alert.status === "active" ? "bg-red-50 text-red-600" : alert.status === "responding" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                                                {alert.status}
                                            </span>
                                        </div>
                                        <p className={`text-xs text-slate-500 leading-relaxed mt-0.5 transition-all ${isActive ? "" : "line-clamp-1"}`}>
                                            {alert.description}
                                        </p>
                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                            {alert.source} · {new Date(alert.created_at ?? "").toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
