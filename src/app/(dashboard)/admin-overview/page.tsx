"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, FlaskConical, DollarSign, Users2, Flag, Shield, RefreshCw, Brain } from "lucide-react";
import { getDashboardStats, getAuditLogs, type DashboardStats, type AuditLog } from "@/lib/supabase/queries";
import { createClient } from "@/utils/supabase/client";

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminOverviewPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [activeOpponents, setActiveOpponents] = useState(0);
    const [loading, setLoading] = useState(true);
    const [aiStats, setAiStats] = useState({ totalPosts: 0, withEmbeddings: 0, fieldReports: 0, candidates: 0 });

    useEffect(() => {
        const supabase = createClient();

        Promise.all([
            getDashboardStats(),
            getAuditLogs({ limit: 10 }),
            supabase.from("candidates").select("id", { count: "exact", head: true }).eq("is_our_candidate", false),
            // AI knowledge base stats
            supabase.from("analyzed_posts").select("id", { count: "exact", head: true }),
            supabase.from("analyzed_posts").select("id", { count: "exact", head: true }).not("embedding", "is", null),
            supabase.from("field_reports").select("id", { count: "exact", head: true }),
            supabase.from("candidates").select("id", { count: "exact", head: true }),
        ]).then(([dashStats, logs, opponents, totalPostsRes, embeddedRes, fieldRes, candRes]) => {
            setStats(dashStats);
            setAuditLogs(logs);
            setActiveOpponents(opponents.count ?? 0);

            setAiStats({
                totalPosts: totalPostsRes.count ?? 0,
                withEmbeddings: embeddedRes.count ?? 0,
                fieldReports: fieldRes.count ?? 0,
                candidates: candRes.count ?? 0,
            });
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const teamSummaries = [
        {
            name: "Research",
            icon: FlaskConical,
            metric: stats ? String(stats.totalPosts) : "—",
            label: "posts analyzed",
            status: "good" as const,
        },
        {
            name: "Outreach / CRM",
            icon: Users2,
            metric: stats ? stats.totalVoterContacts.toLocaleString() : "—",
            label: "voter contacts",
            status: "good" as const,
        },
        {
            name: "Opposition",
            icon: Flag,
            metric: String(activeOpponents),
            label: "tracked opponents",
            status: activeOpponents > 3 ? ("risk" as const) : ("good" as const),
        },
        {
            name: "Field",
            icon: DollarSign,
            metric: stats ? String(stats.totalFieldReports) : "—",
            label: "field reports",
            status: (stats?.activeAlerts ?? 0) > 0 ? ("warning" as const) : ("good" as const),
        },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-4 p-4 md:space-y-6 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-blue-600" />
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-900">Org CRM Overview</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            One place for leadership to see what each team is doing across the CRM.
                        </p>
                    </div>
                </div>
                {loading && <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
                {teamSummaries.map((team) => {
                    const Icon = team.icon;
                    return (
                        <div
                            key={team.name}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                    {team.name}
                                </span>
                                <div className={`p-2 rounded-lg ${
                                    team.status === "good" ? "bg-emerald-50 text-emerald-600" :
                                    team.status === "warning" ? "bg-amber-50 text-amber-700" :
                                    "bg-red-50 text-red-600"
                                }`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
                                {loading ? (
                                    <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
                                ) : (
                                    <>
                                        <h3 className="text-xl font-bold text-slate-900 md:text-2xl">{team.metric}</h3>
                                        <span className="text-xs text-slate-500">{team.label}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Active alerts summary */}
            {!loading && (stats?.activeAlerts ?? 0) > 0 && (
                <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                    <Flag className="h-4 w-4 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800 font-medium">
                        {stats!.activeAlerts} active war room alert{stats!.activeAlerts !== 1 ? "s" : ""} require attention.
                    </p>
                    <Link href="/war-room" className="text-xs font-semibold text-amber-700 hover:underline sm:ml-auto sm:whitespace-nowrap">
                        View War Room →
                    </Link>
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                <h3 className="text-sm font-semibold text-slate-900">Team quick links</h3>
                <p className="text-xs text-slate-500 mt-0.5">Jump into each team workspace, reports, and audit logs.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <Link href="/research" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Research</Link>
                    <Link href="/comms" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Comms</Link>
                    <Link href="/finance" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Finance</Link>
                    <Link href="/call-center" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Call Center</Link>
                    <Link href="/media" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Media</Link>
                    <Link href="/admin/audit-trail" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Audit Trail</Link>
                    <Link href="/admin/users" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Users &amp; Roles</Link>
                </div>
            </div>

            {/* AI Knowledge Base */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-violet-50 rounded-lg"><Brain className="h-4 w-4 text-violet-600" /></div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">AI Knowledge Base</h3>
                            <p className="text-xs text-slate-500 mt-0.5">What the AI assistant can currently answer about.</p>
                        </div>
                    </div>
                    <Link href="/assistant" className="text-xs font-medium text-blue-600 hover:underline">Open AI →</Link>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: "Social posts analyzed", value: aiStats.totalPosts, note: "searchable by AI" },
                        { label: "Posts with embeddings", value: aiStats.withEmbeddings, note: "semantic search ready", highlight: aiStats.withEmbeddings === 0 },
                        { label: "Field reports", value: aiStats.fieldReports, note: "ground intelligence" },
                        { label: "Candidates tracked", value: aiStats.candidates, note: "with standings" },
                    ].map((item) => (
                        <div key={item.label} className={`rounded-lg p-3 ${item.highlight ? "bg-amber-50 border border-amber-200" : "bg-slate-50"}`}>
                            {loading ? (
                                <div className="h-7 w-12 bg-slate-200 rounded animate-pulse mb-1" />
                            ) : (
                                <p className={`text-xl font-bold md:text-2xl ${item.highlight ? "text-amber-700" : "text-slate-900"}`}>{item.value.toLocaleString()}</p>
                            )}
                            <p className="text-[10px] font-medium text-slate-600 leading-tight">{item.label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.highlight ? "Run ingestion pipeline to populate" : item.note}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent audit activity */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 md:px-6">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Recent platform activity</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Latest actions logged across all modules.</p>
                    </div>
                    <Shield className="h-4 w-4 text-slate-400" />
                </div>
                {loading ? (
                    <div className="py-10 flex justify-center"><RefreshCw className="h-5 w-5 text-slate-300 animate-spin" /></div>
                ) : auditLogs.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400">
                        No activity yet. Actions taken in the system will appear here.
                        <br />
                        <span className="text-[10px] text-slate-300">Run migration 005_additions.sql to enable audit logging.</span>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-slate-50 md:hidden">
                            {auditLogs.map((log) => (
                                <div key={log.id} className="space-y-2 px-4 py-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-medium text-slate-700">{log.user_email ?? "System"}</p>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                            log.action === "create" ? "bg-emerald-50 text-emerald-700" :
                                            log.action === "update" ? "bg-blue-50 text-blue-700" :
                                            log.action === "delete" ? "bg-red-50 text-red-600" :
                                            "bg-slate-100 text-slate-600"
                                        }`}>{log.action}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                        <span>{log.module}</span>
                                        <span>{timeAgo(log.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-slate-500">
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Actor</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Action</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Module</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">When</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-xs font-medium text-slate-700">{log.user_email ?? "System"}</td>
                                        <td className="px-6 py-3 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full font-medium ${
                                                log.action === "create" ? "bg-emerald-50 text-emerald-700" :
                                                log.action === "update" ? "bg-blue-50 text-blue-700" :
                                                log.action === "delete" ? "bg-red-50 text-red-600" :
                                                "bg-slate-100 text-slate-600"
                                            }`}>{log.action}</span>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-slate-600">{log.module}</td>
                                        <td className="px-6 py-3 text-xs text-slate-400">{timeAgo(log.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </>
                )}
                {auditLogs.length > 0 && (
                    <div className="border-t border-slate-50 px-4 py-3 md:px-6">
                        <Link href="/admin/audit-trail" className="text-xs text-blue-600 hover:underline">
                            View full audit trail →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
