"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Star, Users, TrendingUp, TrendingDown, Minus,
    ChevronRight, Loader2, Check, Edit2, BarChart3,
} from "lucide-react";
import { getCandidates } from "@/lib/supabase/queries";
import { getParty, useParties, usePartyOptions } from "@/lib/parties";
import type { Candidate } from "@/lib/supabase/queries";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Legend, Cell,
} from "recharts";
import { authFetch } from "@/utils/supabase/auth-fetch";

export default function CandidatesPage() {
    const router = useRouter();
    const { partyMap } = useParties();
    const partyOptions = usePartyOptions();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [editParty, setEditParty] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getCandidates()
            .then((rows) => setCandidates(rows.filter(Boolean)))
            .catch((err) => {
                console.error(err);
                setError("Could not load candidates.");
            })
            .finally(() => setLoading(false));
    }, []);

    async function markAsOurs(id: string, current: boolean) {
        if (current) return; // already ours
        setSaving(id);
        setError(null);
        try {
            const res = await authFetch(`/api/candidates/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_our_candidate: true }),
            });
            const payload = await res.json();
            if (!res.ok || !payload.candidate) {
                throw new Error(payload.error ?? "Could not update candidate");
            }
            const { candidate } = payload;
            setCandidates((prev) =>
                prev.map((c) =>
                    c.id === id ? candidate : { ...c, is_our_candidate: false }
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update candidate");
        } finally {
            setSaving(null);
        }
    }

    async function updateParty(id: string, party: string) {
        setSaving(id);
        setEditParty(null);
        setError(null);
        try {
            const res = await authFetch(`/api/candidates/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ party }),
            });
            const payload = await res.json();
            if (!res.ok || !payload.candidate) {
                throw new Error(payload.error ?? "Could not update party");
            }
            const { candidate } = payload;
            setCandidates((prev) => prev.map((c) => (c.id === id ? candidate : c)));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update party");
        } finally {
            setSaving(null);
        }
    }

    const validCandidates = candidates.filter((candidate): candidate is Candidate => Boolean(candidate?.id));
    const ourCandidate = validCandidates.find((c) => c.is_our_candidate);
    const opponents = validCandidates.filter((c) => !c.is_our_candidate).sort((a, b) => (b.win_prob ?? 0) - (a.win_prob ?? 0));
    const topThreats = opponents.slice(0, 3);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-900">Candidate Intelligence</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Ol Kalou Parliamentary By-Election — {validCandidates.length} candidates tracked</p>
                </div>
                {ourCandidate && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700">
                        <Star className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />
                        Our candidate: {ourCandidate.name}
                    </div>
                )}
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Win Probability Overview */}
            {!loading && validCandidates.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        Win Probability Rankings
                    </h3>
                    <div className="space-y-2.5">
                        {[...validCandidates].sort((a, b) => (b.win_prob ?? 0) - (a.win_prob ?? 0)).map((c, i) => {
                            const party = getParty(c.party, partyMap);
                            return (
                                <div key={c.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push(`/candidates/${c.id}`)}>
                                    <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                                                    {c.name}
                                                </span>
                                                {c.is_our_candidate && <Star className="h-3 w-3 fill-blue-500 text-blue-500" />}
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: party.hexColor }}>
                                                    {party.shortName}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {c.momentum === "rising" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                                                {c.momentum === "declining" && <TrendingDown className="h-3 w-3 text-red-500" />}
                                                {c.momentum === "stable" && <Minus className="h-3 w-3 text-slate-400" />}
                                                <span className={`text-xs font-bold ${c.is_our_candidate ? "text-blue-600" : (c.win_prob ?? 0) > 20 ? "text-red-600" : "text-slate-500"}`}>
                                                    {c.win_prob ?? 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${c.is_our_candidate ? "bg-blue-600" : (c.win_prob ?? 0) > 20 ? "bg-red-500" : "bg-slate-400"}`}
                                                style={{ width: `${c.win_prob ?? 0}%` }}
                                            />
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Top Threats */}
            {topThreats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topThreats.map((c, i) => {
                        const party = getParty(c.party, partyMap);
                        const threatColors = ["bg-red-50 border-red-200", "bg-amber-50 border-amber-200", "bg-yellow-50 border-yellow-200"];
                        const labelColors = ["text-red-700", "text-amber-700", "text-yellow-700"];
                        const labels = ["#1 Threat", "#2 Threat", "#3 Threat"];
                        return (
                            <div
                                key={c.id}
                                onClick={() => router.push(`/candidates/${c.id}`)}
                                className={`${threatColors[i]} border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[10px] font-bold uppercase ${labelColors[i]}`}>{labels[i]}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: party.hexColor }}>{party.shortName}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-900 mb-1">{c.name}</p>
                                <p className="text-2xl font-black text-slate-800">{c.win_prob ?? 0}%</p>
                                <p className="text-[11px] text-slate-500">win probability</p>
                                <div className="mt-3 flex items-center gap-1.5">
                                    {c.threat_level === "high" && <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">High Threat</span>}
                                    {c.threat_level === "medium" && <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">Medium Threat</span>}
                                    {c.momentum === "rising" && <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-semibold">↑ Rising</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* All Candidates Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">All Candidates</h3>
                    <span className="text-xs text-slate-400 ml-auto">Click a row to view full intelligence profile</span>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                )}

                {!loading && (
                    <div className="divide-y divide-slate-50">
                        {validCandidates.map((c) => {
                            const party = getParty(c.party, partyMap);
                            const isEditingParty = editParty === c.id;
                            const isSaving = saving === c.id;
                            const photoUrl = c.photo_url
                                ? `${c.photo_url}${c.photo_url.includes("?") ? "&" : "?"}v=${encodeURIComponent(c.updated_at ?? "")}`
                                : null;

                            return (
                                <div key={c.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        {photoUrl ? (
                                            <Image
                                                src={photoUrl}
                                                alt={c.name}
                                                width={40}
                                                height={40}
                                                unoptimized
                                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${c.is_our_candidate ? "bg-blue-600" : "bg-slate-200"}`}>
                                                <span className={`text-sm font-bold ${c.is_our_candidate ? "text-white" : "text-slate-600"}`}>
                                                    {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                                                </span>
                                            </div>
                                        )}

                                        {/* Name + party */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button
                                                    onClick={() => router.push(`/candidates/${c.id}`)}
                                                    className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left"
                                                >
                                                    {c.name}
                                                </button>
                                                {c.is_our_candidate && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                                        <Star className="h-2.5 w-2.5 fill-blue-500" /> OUR CANDIDATE
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: party.hexColor }}>
                                                    {party.shortName}
                                                </span>
                                            </div>

                                            {/* Party selector */}
                                            {isEditingParty ? (
                                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                    {partyOptions.map((p) => {
                                                        const pt = getParty(p, partyMap);
                                                        return (
                                                            <button
                                                                key={p}
                                                                onClick={() => updateParty(c.id, p)}
                                                                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white hover:opacity-80 transition-opacity"
                                                                style={{ backgroundColor: pt.hexColor }}
                                                            >
                                                                {pt.shortName}
                                                            </button>
                                                        );
                                                    })}
                                                    <button onClick={() => setEditParty(null)} className="text-[10px] text-slate-400 hover:text-slate-600">cancel</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditParty(c.id); }}
                                                    className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-500 transition-colors"
                                                >
                                                    <Edit2 className="h-2.5 w-2.5" />
                                                    {c.party === "TBD" || !c.party ? "Set party" : `Change party`}
                                                </button>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="hidden md:flex items-center gap-6 text-center">
                                            <div>
                                                <p className="text-lg font-black text-slate-900">{c.win_prob ?? 0}%</p>
                                                <p className="text-[10px] text-slate-400">Win prob</p>
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900">{c.sentiment_positive ?? 0}%</p>
                                                <p className="text-[10px] text-slate-400">Positive</p>
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900">{c.mention_count_7d ?? 0}</p>
                                                <p className="text-[10px] text-slate-400">Mentions</p>
                                            </div>
                                            <div>
                                                <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                                                    c.threat_level === "high" ? "bg-red-50 text-red-600" :
                                                    c.threat_level === "medium" ? "bg-amber-50 text-amber-600" :
                                                    c.threat_level === "low" ? "bg-emerald-50 text-emerald-600" :
                                                    "bg-slate-100 text-slate-500"
                                                }`}>
                                                    {c.threat_level ?? "—"}
                                                </span>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Threat</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 ml-2">
                                            <button
                                                onClick={() => markAsOurs(c.id, !!c.is_our_candidate)}
                                                disabled={!!c.is_our_candidate || isSaving}
                                                title={c.is_our_candidate ? "This is your candidate" : "Mark as our candidate"}
                                                className={`p-2 rounded-lg transition-all ${
                                                    c.is_our_candidate
                                                        ? "bg-blue-600 text-white cursor-default"
                                                        : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                                }`}
                                            >
                                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => router.push(`/candidates/${c.id}`)}
                                                className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                title="View full profile"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sentiment Comparison Chart */}
            {!loading && validCandidates.length > 0 && (
                <div className="bg-white rounded-xl border border-[#EAEAEA] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-4 w-4 text-[#787774]" />
                        <h3 className="text-sm font-semibold text-[#111111]">Sentiment by Candidate</h3>
                        <span className="text-xs text-[#787774] ml-1">positive / neutral / negative distribution</span>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[...validCandidates]
                                    .filter((c) => (c.sentiment_positive ?? 0) + (c.sentiment_negative ?? 0) + (c.sentiment_neutral ?? 0) > 0)
                                    .sort((a, b) => (b.sentiment_positive ?? 0) - (a.sentiment_positive ?? 0))
                                    .map((c) => ({
                                        name: c.name.split(" ").slice(-1)[0], // last name only
                                        positive: c.sentiment_positive ?? 0,
                                        neutral: c.sentiment_neutral ?? 0,
                                        negative: c.sentiment_negative ?? 0,
                                    }))}
                                margin={{ left: -8, right: 8 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F1" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#B0ADAA" }} />
                                <YAxis tick={{ fontSize: 10, fill: "#B0ADAA" }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ fontSize: 11, border: "1px solid #EAEAEA", borderRadius: 6, boxShadow: "none" }}
                                    cursor={{ fill: "rgba(0,0,0,0.02)" }}
                                />
                                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                                <Bar dataKey="positive" name="Positive" stackId="a" fill="#346538" />
                                <Bar dataKey="neutral"  name="Neutral"  stackId="a" fill="#B0ADAA" />
                                <Bar dataKey="negative" name="Negative" stackId="a" fill="#9F2F2D" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {validCandidates.every((c) => !(c.sentiment_positive ?? 0) && !(c.sentiment_negative ?? 0)) && (
                        <p className="text-xs text-[#B0ADAA] text-center py-6">Sentiment data will appear once posts are analyzed.</p>
                    )}
                </div>
            )}

            {/* Mentions & Win Probability Chart */}
            {!loading && validCandidates.length > 0 && (
                <div className="bg-white rounded-xl border border-[#EAEAEA] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-4 w-4 text-[#787774]" />
                        <h3 className="text-sm font-semibold text-[#111111]">7-Day Mentions &amp; Win Probability</h3>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={[...validCandidates]
                                    .sort((a, b) => (b.mention_count_7d ?? 0) - (a.mention_count_7d ?? 0))
                                    .map((c) => ({
                                        name: c.name.split(" ").slice(-1)[0],
                                        mentions: c.mention_count_7d ?? 0,
                                        win_prob: c.win_prob ?? 0,
                                        isOurs: c.is_our_candidate,
                                    }))}
                                margin={{ left: 8, right: 16 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F1" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: "#B0ADAA" }} allowDecimals={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#B0ADAA" }} width={60} />
                                <Tooltip
                                    contentStyle={{ fontSize: 11, border: "1px solid #EAEAEA", borderRadius: 6, boxShadow: "none" }}
                                    cursor={{ fill: "rgba(0,0,0,0.02)" }}
                                />
                                <Bar dataKey="mentions" name="7d Mentions" radius={[0, 3, 3, 0]}>
                                    {[...validCandidates]
                                        .sort((a, b) => (b.mention_count_7d ?? 0) - (a.mention_count_7d ?? 0))
                                        .map((c, i) => (
                                            <Cell key={i} fill={c.is_our_candidate ? "#111111" : "#D0CDCA"} />
                                        ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Instructions banner */}
            {!loading && !ourCandidate && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Mark your candidate</p>
                        <p className="text-xs mt-0.5 text-blue-600">Click the ★ button next to the candidate you are managing. The system will then track them as &quot;ours&quot; and optimise all intelligence around them.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
