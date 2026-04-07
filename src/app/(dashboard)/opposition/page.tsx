"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Flag, TrendingUp, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Candidate, AnalyzedPost } from "@/lib/supabase/queries";

interface NarrativeItem {
    id: string;
    theme: string;
    region: string | null;
    intensity: "High" | "Medium" | "Low";
    lastSeen: string;
    platform: string | null;
}

function intensityFromCount(count: number): "High" | "Medium" | "Low" {
    if (count >= 10) return "High";
    if (count >= 3)  return "Medium";
    return "Low";
}

function timeAgo(iso: string | null) {
    if (!iso) return "Unknown";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function OppositionPage() {
    const [opponents, setOpponents] = useState<Candidate[]>([]);
    const [narratives, setNarratives] = useState<NarrativeItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        Promise.all([
            // Opposition candidates (not ours, ordered by threat)
            supabase.from("candidates")
                .select("*")
                .eq("is_our_candidate", false)
                .order("win_prob", { ascending: false }),

            // Negative-sentiment analyzed posts as narratives
            supabase.from("analyzed_posts")
                .select("id, key_insight, sentiment, analyzed_at, candidates_mentioned")
                .eq("sentiment", "negative")
                .not("key_insight", "is", null)
                .order("analyzed_at", { ascending: false })
                .limit(50),
        ]).then(([cands, posts]) => {
            setOpponents(cands.data ?? []);

            // Deduplicate by key_insight theme — group similar insights
            const seen = new Map<string, { count: number; item: AnalyzedPost }>();
            for (const p of (posts.data ?? []) as AnalyzedPost[]) {
                const key = (p.key_insight ?? "").slice(0, 40);
                if (seen.has(key)) {
                    seen.get(key)!.count++;
                } else {
                    seen.set(key, { count: 1, item: p });
                }
            }

            const items: NarrativeItem[] = Array.from(seen.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, 8)
                .map(({ count, item }, i) => ({
                    id: `OPP-NAR-${String(i + 1).padStart(2, "0")}`,
                    theme: item.key_insight ?? "Unknown theme",
                    region: (item.candidates_mentioned ?? []).join(", ") || null,
                    intensity: intensityFromCount(count),
                    lastSeen: timeAgo(item.analyzed_at ?? null),
                    platform: null,
                }));

            setNarratives(items);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const riskScore = opponents.length > 0
        ? Math.round(opponents.slice(0, 3).reduce((s, c) => s + (c.win_prob ?? 0), 0) / 3)
        : 0;

    const riskLevel = riskScore >= 60 ? "Critical" : riskScore >= 40 ? "High" : riskScore >= 25 ? "Moderate" : "Low";
    const riskColor = riskScore >= 60 ? "bg-red-500" : riskScore >= 40 ? "bg-amber-500" : riskScore >= 25 ? "bg-amber-400" : "bg-emerald-500";

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-900">Opposition Tracker</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Candidate threats, share of voice, and active opposition narratives.
                    </p>
                </div>
                {loading && <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Opponent candidates table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Key opposition candidates</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Win probability and perceived threat level.</p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-slate-400" />
                    </div>
                    {loading ? (
                        <div className="py-12 flex justify-center"><RefreshCw className="h-5 w-5 text-slate-300 animate-spin" /></div>
                    ) : opponents.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400">No opposition candidates found. Add candidates in the Candidates page.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left text-slate-500">
                                        <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Candidate</th>
                                        <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Party</th>
                                        <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Win Prob</th>
                                        <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Threat</th>
                                        <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Momentum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {opponents.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                                                        <Flag className="h-3 w-3" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{c.name}</p>
                                                        <p className="text-[10px] text-slate-400">{c.constituency ?? "Ol Kalou"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-xs text-slate-600">{c.party ?? "—"}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${c.win_prob ?? 0}%` }} />
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-900">{c.win_prob ?? 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    c.threat_level === "high" || c.threat_level === "critical" ? "bg-red-50 text-red-600" :
                                                    c.threat_level === "medium" ? "bg-amber-50 text-amber-700" :
                                                    "bg-slate-100 text-slate-600"
                                                }`}>{c.threat_level ?? "low"}</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`text-xs font-medium ${
                                                    c.momentum === "rising" ? "text-emerald-600" :
                                                    c.momentum === "declining" ? "text-red-500" :
                                                    "text-slate-400"
                                                }`}>{c.momentum ?? "stable"}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Risk meter */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900">Risk monitor</h3>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-xs font-semibold text-slate-700">Overall threat level</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    riskLevel === "Critical" ? "bg-red-50 text-red-600" :
                                    riskLevel === "High" ? "bg-amber-50 text-amber-600" :
                                    riskLevel === "Moderate" ? "bg-yellow-50 text-yellow-600" :
                                    "bg-emerald-50 text-emerald-600"
                                }`}>{riskLevel}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div className={`${riskColor} h-full rounded-full transition-all`} style={{ width: `${riskScore}%` }} />
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5">
                                Based on top 3 opponent win probabilities (avg: {riskScore}%)
                            </p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                            <p className="font-semibold text-slate-800">Suggested actions:</p>
                            {riskScore >= 40 ? (
                                <>
                                    <p>• Increase ground team activity in high-risk wards</p>
                                    <p>• Counter narratives on social media immediately</p>
                                    <p>• Escalate to war room for monitoring</p>
                                </>
                            ) : (
                                <>
                                    <p>• Maintain current momentum</p>
                                    <p>• Continue community engagement events</p>
                                    <p>• Monitor social media weekly</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Negative narratives from analyzed posts */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900">Active opposition narratives</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Themes from negative-sentiment social posts — grouped by frequency.</p>
                </div>
                {narratives.length === 0 && !loading ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                        No negative narratives detected yet. Populate analyzed_posts with negative sentiment data.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-slate-500">
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Narrative</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Candidates Mentioned</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Intensity</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Last seen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {narratives.map((n) => (
                                    <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <p className="font-medium text-slate-900 text-xs">{n.theme}</p>
                                            <p className="text-[10px] text-slate-400">{n.id}</p>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-slate-600">{n.region ?? "—"}</td>
                                        <td className="px-6 py-3">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                n.intensity === "High" ? "bg-red-50 text-red-600" :
                                                n.intensity === "Medium" ? "bg-amber-50 text-amber-700" :
                                                "bg-slate-100 text-slate-600"
                                            }`}>{n.intensity}</span>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-slate-600">{n.lastSeen}</td>
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
