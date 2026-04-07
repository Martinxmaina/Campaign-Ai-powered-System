"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Globe, Download, RefreshCw, MessageSquare } from "lucide-react";
import dynamic from "next/dynamic";
import type ExecutiveKpiCardType from "@/components/charts/ExecutiveKpiCard";
import type ExecutiveBarChartType from "@/components/charts/ExecutiveBarChart";
const ExecutiveKpiCard = dynamic(() => import("@/components/charts/ExecutiveKpiCard"), { ssr: false }) as typeof ExecutiveKpiCardType;
const ExecutiveBarChart = dynamic(() => import("@/components/charts/ExecutiveBarChart"), { ssr: false }) as typeof ExecutiveBarChartType;
import { createClient } from "@/utils/supabase/client";
import type { MessageSent } from "@/lib/supabase/queries";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Cell, Legend,
} from "recharts";

interface ChannelRow {
    channel: string;
    sent: number;
    delivered: number;
    responseRate: number;
}

interface WardReach {
    ward: string;
    count: number;
    pct: number;
}

interface CandidateRow {
    name: string;
    shortName: string;
    win_prob: number;
    sentiment_positive: number;
    sentiment_negative: number;
    sentiment_neutral: number;
    mention_count_7d: number;
    is_our_candidate: boolean;
}

export default function AnalyticsPage() {
    const [totalPosts, setTotalPosts] = useState(0);
    const [totalFieldReports, setTotalFieldReports] = useState(0);
    const [totalMessagesSent, setTotalMessagesSent] = useState(0);
    const [totalMessagesDelivered, setTotalMessagesDelivered] = useState(0);
    const [channels, setChannels] = useState<ChannelRow[]>([]);
    const [wardReach, setWardReach] = useState<WardReach[]>([]);
    const [candidates, setCandidates] = useState<CandidateRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        Promise.all([
            supabase.from("raw_posts").select("id", { count: "exact", head: true }),
            supabase.from("field_reports").select("ward"),
            supabase.from("messages_sent").select("*").order("sent_at", { ascending: false }).limit(200),
            supabase
                .from("candidates")
                .select("name, win_prob, sentiment_positive, sentiment_negative, sentiment_neutral, mention_count_7d, is_our_candidate, party")
                .order("win_prob", { ascending: false }),
        ]).then(([rawPosts, fieldReports, messages, candidatesRes]) => {
            setTotalPosts(rawPosts.count ?? 0);

            // Ward reach
            const wardMap = new Map<string, number>();
            for (const r of (fieldReports.data ?? [])) {
                if (r.ward) wardMap.set(r.ward, (wardMap.get(r.ward) ?? 0) + 1);
            }
            setTotalFieldReports(fieldReports.data?.length ?? 0);

            const totalWardReports = Array.from(wardMap.values()).reduce((s, c) => s + c, 0) || 1;
            const wards = Array.from(wardMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([ward, count]) => ({ ward, count, pct: Math.round((count / totalWardReports) * 100) }));
            setWardReach(wards);

            // Channel aggregation
            const msgData = (messages.data ?? []) as MessageSent[];
            const channelMap = new Map<string, { sent: number; delivered: number }>();
            let totalSent = 0;
            let totalDelivered = 0;
            for (const m of msgData) {
                const ch = m.channel ?? "Unknown";
                const prev = channelMap.get(ch) ?? { sent: 0, delivered: 0 };
                channelMap.set(ch, {
                    sent: prev.sent + (m.sent_count ?? 0),
                    delivered: prev.delivered + (m.delivered_count ?? 0),
                });
                totalSent += m.sent_count ?? 0;
                totalDelivered += m.delivered_count ?? 0;
            }
            setTotalMessagesSent(totalSent);
            setTotalMessagesDelivered(totalDelivered);

            const channelRows: ChannelRow[] = Array.from(channelMap.entries())
                .sort((a, b) => b[1].sent - a[1].sent)
                .map(([channel, { sent, delivered }]) => ({
                    channel,
                    sent,
                    delivered,
                    responseRate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
                }));
            setChannels(channelRows);

            // Candidates
            const cands = (candidatesRes.data ?? []) as Record<string, unknown>[];
            setCandidates(cands.map((c) => {
                const parts = String(c.name ?? "").trim().split(/\s+/);
                const shortName = parts.length <= 2
                    ? parts.join(" ")
                    : `${parts[0]} ${parts[parts.length - 1]}`;
                return {
                    name: String(c.name ?? ""),
                    shortName,
                    win_prob: Number(c.win_prob ?? 0),
                    sentiment_positive: Number(c.sentiment_positive ?? 0),
                    sentiment_negative: Number(c.sentiment_negative ?? 0),
                    sentiment_neutral: Number(c.sentiment_neutral ?? 0),
                    mention_count_7d: Number(c.mention_count_7d ?? 0),
                    is_our_candidate: Boolean(c.is_our_candidate),
                };
            }));
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const deliveryRate = totalMessagesSent > 0 ? ((totalMessagesDelivered / totalMessagesSent) * 100).toFixed(1) : "0";

    const kpis = [
        {
            label: "Posts Monitored",
            value: totalPosts > 999 ? `${(totalPosts / 1000).toFixed(1)}K` : String(totalPosts),
            change: "Live",
            positive: true,
            icon: <Globe className="h-4 w-4" />,
        },
        {
            label: "Field Reports",
            value: totalFieldReports > 999 ? `${(totalFieldReports / 1000).toFixed(1)}K` : String(totalFieldReports),
            change: "Live",
            positive: true,
            icon: <Users className="h-4 w-4" />,
        },
        {
            label: "Messages Sent",
            value: totalMessagesSent > 999 ? `${(totalMessagesSent / 1000).toFixed(1)}K` : String(totalMessagesSent),
            change: "Live",
            positive: true,
            icon: <MessageSquare className="h-4 w-4" />,
        },
        {
            label: "Delivery Rate",
            value: `${deliveryRate}%`,
            change: "Live",
            positive: parseFloat(deliveryRate) >= 90,
            icon: <TrendingUp className="h-4 w-4" />,
        },
    ];

    const hasCandidateSentiment = candidates.some((c) => c.sentiment_positive + c.sentiment_negative > 0);
    const hasMentions = candidates.some((c) => c.mention_count_7d > 0);

    // Dynamic sizing based on candidate count
    const BAR_HEIGHT = 44; // px per row in vertical bar charts
    const verticalChartHeight = Math.max(200, candidates.length * BAR_HEIGHT);
    const maxNameLen = candidates.reduce((max, c) => Math.max(max, c.shortName.length), 0);
    const yAxisWidth = Math.min(150, Math.max(90, maxNameLen * 7));

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-semibold text-[#111111]">Analytics &amp; Reports</h1>
                    <p className="text-sm text-[#787774] mt-0.5">Campaign performance metrics across all channels.</p>
                </div>
                <div className="flex items-center gap-2">
                    {loading && <RefreshCw className="h-4 w-4 text-[#B0ADAA] animate-spin" />}
                    <button className="flex items-center gap-2 bg-white border border-[#EAEAEA] px-4 py-2 rounded-[6px] text-sm font-medium hover:border-[#111111] transition-colors text-[#2F3437]">
                        <Download className="h-4 w-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <ExecutiveKpiCard
                        key={kpi.label}
                        label={kpi.label}
                        value={kpi.value}
                        change={kpi.change}
                        positive={kpi.positive}
                        icon={kpi.icon}
                    />
                ))}
            </div>

            {/* ── Candidate Bar Charts ─────────────────────────────────────────────── */}
            {(candidates.length > 0 || loading) && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#787774]" />
                        <h2 className="text-sm font-semibold text-[#111111]">Candidate Performance</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Win Probability */}
                        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#787774] mb-4">Win Probability (%)</h3>
                            {loading ? (
                                <div className="h-48 flex items-center justify-center">
                                    <RefreshCw className="h-4 w-4 text-[#EAEAEA] animate-spin" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={verticalChartHeight}>
                                    <BarChart
                                        layout="vertical"
                                        data={candidates.map((c) => ({ name: c.shortName, value: c.win_prob, isOurs: c.is_our_candidate }))}
                                        margin={{ left: 0, right: 20, top: 4, bottom: 4 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F1" horizontal={false} />
                                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#B0ADAA" }} tickFormatter={(v) => `${v}%`} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#2F3437" }} width={yAxisWidth} />
                                        <Tooltip
                                            formatter={(v) => [`${v}%`, "Win prob"]}
                                            contentStyle={{ fontSize: 11, border: "1px solid #EAEAEA", borderRadius: 6, boxShadow: "none" }}
                                            cursor={{ fill: "rgba(0,0,0,0.02)" }}
                                        />
                                        <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={28}>
                                            {candidates.map((c, i) => (
                                                <Cell key={i} fill={c.is_our_candidate ? "#111111" : "#D0CDCA"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* 7-Day Mentions */}
                        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#787774] mb-4">7-Day Social Mentions</h3>
                            {loading ? (
                                <div className="h-48 flex items-center justify-center">
                                    <RefreshCw className="h-4 w-4 text-[#EAEAEA] animate-spin" />
                                </div>
                            ) : !hasMentions ? (
                                <div className="h-48 flex items-center justify-center text-xs text-[#B0ADAA]">
                                    No mention data yet
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={verticalChartHeight}>
                                    <BarChart
                                        layout="vertical"
                                        data={[...candidates].sort((a, b) => b.mention_count_7d - a.mention_count_7d).map((c) => ({ name: c.shortName, mentions: c.mention_count_7d, isOurs: c.is_our_candidate }))}
                                        margin={{ left: 0, right: 20, top: 4, bottom: 4 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F1" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 10, fill: "#B0ADAA" }} allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#2F3437" }} width={yAxisWidth} />
                                        <Tooltip
                                            contentStyle={{ fontSize: 11, border: "1px solid #EAEAEA", borderRadius: 6, boxShadow: "none" }}
                                            cursor={{ fill: "rgba(0,0,0,0.02)" }}
                                        />
                                        <Bar dataKey="mentions" name="Mentions" radius={[0, 3, 3, 0]} maxBarSize={28}>
                                            {[...candidates].sort((a, b) => b.mention_count_7d - a.mention_count_7d).map((c, i) => (
                                                <Cell key={i} fill={c.is_our_candidate ? "#111111" : "#D0CDCA"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Sentiment Comparison — full width */}
                        <div className="lg:col-span-2 bg-white border border-[#EAEAEA] rounded-[12px] p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#787774] mb-4">Candidate Sentiment Breakdown</h3>
                            {loading ? (
                                <div className="h-52 flex items-center justify-center">
                                    <RefreshCw className="h-4 w-4 text-[#EAEAEA] animate-spin" />
                                </div>
                            ) : !hasCandidateSentiment ? (
                                <div className="h-52 flex items-center justify-center text-xs text-[#B0ADAA]">
                                    Sentiment data will appear once posts are analyzed
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={verticalChartHeight}>
                                    <BarChart
                                        layout="vertical"
                                        data={candidates.map((c) => ({
                                            name: c.shortName,
                                            Positive: c.sentiment_positive,
                                            Neutral: c.sentiment_neutral,
                                            Negative: c.sentiment_negative,
                                        }))}
                                        margin={{ left: 0, right: 20, top: 4, bottom: 4 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F1" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 10, fill: "#B0ADAA" }} allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#2F3437" }} width={yAxisWidth} />
                                        <Tooltip
                                            contentStyle={{ fontSize: 11, border: "1px solid #EAEAEA", borderRadius: 6, boxShadow: "none" }}
                                            cursor={{ fill: "rgba(0,0,0,0.02)" }}
                                        />
                                        <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                                        <Bar dataKey="Positive" stackId="a" fill="#346538" maxBarSize={28} />
                                        <Bar dataKey="Neutral"  stackId="a" fill="#B0ADAA" maxBarSize={28} />
                                        <Bar dataKey="Negative" stackId="a" fill="#9F2F2D" radius={[0, 3, 3, 0]} maxBarSize={28} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Channel + Ward ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {channels.length > 0 ? (
                        <ExecutiveBarChart
                            title="Channel Performance"
                            subtitle="Delivery rate by messaging channel"
                            data={channels.map(ch => ({ channel: ch.channel, rate: ch.responseRate }))}
                            xKey="channel"
                            yKey="rate"
                            valueLabel="Delivery rate (%)"
                            color="#111111"
                        />
                    ) : (
                        <div className="bg-white rounded-[12px] border border-[#EAEAEA] p-6">
                            <h3 className="text-sm font-semibold text-[#111111] mb-1">Channel Performance</h3>
                            <p className="text-xs text-[#787774] mb-4">Delivery rate by messaging channel</p>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-5 w-5 text-[#EAEAEA] animate-spin" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-12 text-xs text-[#B0ADAA]">
                                    <BarChart3 className="h-5 w-5 mr-2 text-[#EAEAEA]" />
                                    No messaging data yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-[12px] border border-[#EAEAEA]">
                    <h3 className="text-sm font-semibold text-[#111111] mb-5">Field Reach by Ward</h3>
                    {loading ? (
                        <div className="flex justify-center py-8"><RefreshCw className="h-4 w-4 text-[#EAEAEA] animate-spin" /></div>
                    ) : wardReach.length === 0 ? (
                        <p className="text-xs text-[#B0ADAA] text-center py-8">No field reports yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {wardReach.map((w) => (
                                <div key={w.ward}>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-medium text-[#2F3437]">{w.ward}</span>
                                        <span className="font-semibold text-[#111111]">{w.count} reports</span>
                                    </div>
                                    <div className="w-full bg-[#F7F6F3] h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-[#111111] h-full rounded-full" style={{ width: `${w.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Messaging channel table */}
            {channels.length > 0 && (
                <div className="bg-white rounded-[12px] border border-[#EAEAEA]">
                    <div className="px-6 py-4 border-b border-[#EAEAEA]">
                        <h3 className="text-sm font-semibold text-[#111111]">Messaging breakdown</h3>
                        <p className="text-xs text-[#787774] mt-0.5">Sent vs delivered per channel</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#EAEAEA] text-left text-[#787774]">
                                    <th className="px-6 py-3 font-medium text-[10px] uppercase tracking-[0.06em]">Channel</th>
                                    <th className="px-6 py-3 font-medium text-[10px] uppercase tracking-[0.06em]">Sent</th>
                                    <th className="px-6 py-3 font-medium text-[10px] uppercase tracking-[0.06em]">Delivered</th>
                                    <th className="px-6 py-3 font-medium text-[10px] uppercase tracking-[0.06em]">Delivery rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F7F6F3]">
                                {channels.map((ch) => (
                                    <tr key={ch.channel} className="hover:bg-[#F7F6F3] transition-colors">
                                        <td className="px-6 py-3 text-sm font-medium text-[#111111]">{ch.channel}</td>
                                        <td className="px-6 py-3 text-xs text-[#787774]">{ch.sent.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-xs text-[#787774]">{ch.delivered.toLocaleString()}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-[#F7F6F3] h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${ch.responseRate}%`,
                                                            backgroundColor: ch.responseRate >= 90 ? "#346538" : ch.responseRate >= 70 ? "#956400" : "#9F2F2D",
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-[#111111]">{ch.responseRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
