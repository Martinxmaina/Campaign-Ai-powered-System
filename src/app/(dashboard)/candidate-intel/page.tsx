"use client";

import { useEffect, useState } from "react";
import {
    Brain, RefreshCw, Loader2, Trophy, Globe, ChevronDown, ChevronUp,
    Facebook, Twitter, Youtube, Instagram, ExternalLink,
} from "lucide-react";
import { getCandidateIntel } from "@/lib/supabase/queries";
import type { CandidateIntelWithCandidate } from "@/lib/supabase/queries";
import { getParty, useParties } from "@/lib/parties";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { authFetch } from "@/utils/supabase/auth-fetch";

// TikTok icon placeholder (lucide doesn't have one)
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.28 8.28 0 005.58 2.17V12a4.84 4.84 0 01-3.77-1.54V6.69h3.77z" />
        </svg>
    );
}

interface SocialFollowers {
    facebook?: number;
    twitter?: number;
    youtube?: number;
    tiktok?: number;
    instagram?: number;
}

function formatFollowers(n: number | undefined): string {
    if (!n || n === 0) return "N/A";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
}

export default function CandidateIntelPage() {
    const { partyMap } = useParties();
    const [intel, setIntel] = useState<CandidateIntelWithCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function load() {
            try {
                const data = await getCandidateIntel();
                setIntel(data);
            } catch (err) {
                console.error("Failed to load candidate intel:", err);
            }
            setLoading(false);
        }
        load();
    }, []);

    async function handleRefresh() {
        setRefreshing(true);
        try {
            const res = await authFetch("/api/candidate-intel/refresh", { method: "POST" });
            const result = await res.json();
            if (result.status === "triggered") {
                // Reload after a short delay to give workflows time to start
                setTimeout(async () => {
                    const data = await getCandidateIntel();
                    setIntel(data);
                    setRefreshing(false);
                }, 3000);
            } else {
                setRefreshing(false);
            }
        } catch {
            setRefreshing(false);
        }
    }

    function toggleCard(id: string) {
        setExpandedCards((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    // Prepare chart data — party support breakdown
    const partyColors: Record<string, string> = {
        UDA: "#2563eb", DCP: "#16a34a", Jubilee: "#d97706", ODM: "#dc2626",
        Wiper: "#7c3aed", ANC: "#0891b2", "Ford Kenya": "#be185d", Independent: "#64748b",
    };

    // For each candidate: find their dominant party
    const partyChartData = intel
        .map((item) => {
            const breakdown = (item.party_support_breakdown || {}) as Record<string, number>;
            const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
            const topParty = entries[0]?.[0] || "—";
            const topPct = entries[0]?.[1] || 0;
            return {
                name: item.candidates?.name?.split(" ").slice(-1)[0] || "Unknown",
                fullName: item.candidates?.name || "Unknown",
                topParty,
                ratio: topPct,
                color: partyColors[topParty] || "#94a3b8",
                isOurs: item.candidates?.is_our_candidate || false,
            };
        })
        .filter((d) => d.ratio > 0)
        .sort((a, b) => b.ratio - a.ratio);

    const fameChartData = intel
        .filter((item) => item.fame_rank)
        .map((item) => ({
            name: item.candidates?.name?.split(" ").slice(-1)[0] || "Unknown",
            fullName: item.candidates?.name || "Unknown",
            mentions: item.candidates?.mention_count_7d || 0,
            rank: item.fame_rank || 99,
            isOurs: item.candidates?.is_our_candidate || false,
        }))
        .sort((a, b) => a.rank - b.rank);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        Candidate Intelligence
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        AI-powered research across all candidates — Exa + Perplexity
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Refreshing..." : "Refresh Intel"}
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
            ) : intel.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <Brain className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">No intelligence data yet</h3>
                    <p className="text-xs text-slate-400 mb-4">
                        Click &ldquo;Refresh Intel&rdquo; to trigger AI research workflows for all candidates.
                    </p>
                </div>
            ) : (
                <>
                    {/* Party Support Breakdown Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                            Party Support in Social Media
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Dominant party mentioned in social media per candidate (UDA, DCP, Jubilee, ODM, etc.)
                        </p>
                        {partyChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={partyChartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`}
                                        tick={{ fontSize: 11 }} />
                                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        formatter={(value, _name, props) => [
                                            `${Number(value).toFixed(1)}% (${props.payload?.topParty || ""})`,
                                            "Top Party",
                                        ]}
                                        labelFormatter={(label) => {
                                            const item = partyChartData.find((d) => d.name === String(label));
                                            return item?.fullName || String(label);
                                        }}
                                    />
                                    <Bar dataKey="ratio" radius={[0, 4, 4, 0]}>
                                        {partyChartData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-8">No party support data yet. Click Refresh Intel to start analysis.</p>
                        )}
                    </div>

                    {/* Fame / Popularity Ranking Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            Candidate Fame / Popularity Ranking
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Ranked by composite score: 7-day mentions, social followers, and endorsements
                        </p>
                        {fameChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={fameChartData} margin={{ left: 20, right: 30 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        formatter={(value) => [Number(value), "7d Mentions"]}
                                        labelFormatter={(label) => {
                                            const item = fameChartData.find((d) => d.name === String(label));
                                            return `#${item?.rank} — ${item?.fullName || String(label)}`;
                                        }}
                                    />
                                    <Bar dataKey="mentions" radius={[4, 4, 0, 0]}>
                                        {fameChartData.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={entry.isOurs ? "#2563eb" : "#94a3b8"}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-8">No fame ranking data available yet.</p>
                        )}
                    </div>

                    {/* Candidate Intel Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {intel.map((item) => {
                            const party = getParty(item.party_affiliation || item.candidates?.party, partyMap);
                            const followers = (item.social_media_followers || {}) as SocialFollowers;
                            const isExpanded = expandedCards.has(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                                        item.candidates?.is_our_candidate
                                            ? "border-blue-300 ring-1 ring-blue-100"
                                            : "border-slate-200"
                                    }`}
                                >
                                    {/* Card Header */}
                                    <div className="px-5 py-4 border-b border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {item.candidates?.photo_url ? (
                                                    <img
                                                        src={item.candidates.photo_url}
                                                        alt={item.candidates.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                        {item.candidates?.name?.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-900">
                                                        {item.candidates?.name}
                                                    </h4>
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: party.hexColor }}>
                                                        {party.shortName}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.fame_rank && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                                                        #{item.fame_rank}
                                                    </span>
                                                )}
                                                {item.candidates?.is_our_candidate && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                                                        OUR CANDIDATE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="px-5 py-4 space-y-3">
                                        {/* Party Affiliation */}
                                        {item.party_affiliation && (
                                            <div>
                                                <p className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5">Party Affiliation</p>
                                                <p className="text-xs text-slate-700">{item.party_affiliation}</p>
                                            </div>
                                        )}

                                        {/* Campaign Platforms */}
                                        {item.campaign_platforms && item.campaign_platforms.length > 0 && (
                                            <div>
                                                <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Campaign Platforms</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.campaign_platforms.map((platform, i) => (
                                                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                                                            {platform}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Social Media Followers */}
                                        <div>
                                            <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Social Media Followers</p>
                                            <div className="grid grid-cols-5 gap-1">
                                                <div className="text-center p-1.5 rounded bg-blue-50">
                                                    <Facebook className="h-3 w-3 text-blue-600 mx-auto mb-0.5" />
                                                    <p className="text-[9px] font-bold text-slate-700">{formatFollowers(followers.facebook)}</p>
                                                </div>
                                                <div className="text-center p-1.5 rounded bg-sky-50">
                                                    <Twitter className="h-3 w-3 text-sky-500 mx-auto mb-0.5" />
                                                    <p className="text-[9px] font-bold text-slate-700">{formatFollowers(followers.twitter)}</p>
                                                </div>
                                                <div className="text-center p-1.5 rounded bg-red-50">
                                                    <Youtube className="h-3 w-3 text-red-500 mx-auto mb-0.5" />
                                                    <p className="text-[9px] font-bold text-slate-700">{formatFollowers(followers.youtube)}</p>
                                                </div>
                                                <div className="text-center p-1.5 rounded bg-pink-50">
                                                    <TikTokIcon className="h-3 w-3 text-pink-600 mx-auto mb-0.5" />
                                                    <p className="text-[9px] font-bold text-slate-700">{formatFollowers(followers.tiktok)}</p>
                                                </div>
                                                <div className="text-center p-1.5 rounded bg-violet-50">
                                                    <Instagram className="h-3 w-3 text-violet-500 mx-auto mb-0.5" />
                                                    <p className="text-[9px] font-bold text-slate-700">{formatFollowers(followers.instagram)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Party Support Breakdown */}
                                        {item.party_support_breakdown && Object.keys(item.party_support_breakdown as Record<string, number>).length > 0 && (
                                            <div>
                                                <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Party Support Breakdown</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.entries((item.party_support_breakdown as Record<string, number>))
                                                        .sort((a, b) => b[1] - a[1])
                                                        .map(([party, pct]) => (
                                                            <span
                                                                key={party}
                                                                className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white"
                                                                style={{ backgroundColor: partyColors[party] || "#64748b" }}
                                                            >
                                                                {party} {Number(pct).toFixed(0)}%
                                                            </span>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )}

                                        {/* Local Endorsements */}
                                        {item.local_endorsements && item.local_endorsements.length > 0 && (
                                            <div>
                                                <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Local Endorsements</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.local_endorsements.map((endorsement, i) => (
                                                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                                                            {endorsement}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Popularity Notes */}
                                        {item.popularity_notes && (
                                            <div>
                                                <p className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5">Popularity Notes</p>
                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                    {item.popularity_notes}
                                                </p>
                                            </div>
                                        )}

                                        {/* Expandable Section: Perplexity Analysis + Sources */}
                                        {(item.perplexity_analysis || (item.sources && item.sources.length > 0)) && (
                                            <div>
                                                <button
                                                    onClick={() => toggleCard(item.id)}
                                                    className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                    {isExpanded ? "Hide" : "Show"} Deep Analysis & Sources
                                                </button>
                                                {isExpanded && (
                                                    <div className="mt-2 space-y-2">
                                                        {item.perplexity_analysis && (
                                                            <div className="bg-slate-50 rounded-lg p-3">
                                                                <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
                                                                    Perplexity Deep Analysis
                                                                </p>
                                                                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar">
                                                                    {item.perplexity_analysis}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {item.sources && item.sources.length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                                                    <Globe className="h-3 w-3" /> Sources ({item.sources.length})
                                                                </p>
                                                                <div className="space-y-0.5">
                                                                    {item.sources.slice(0, 10).map((src, i) => (
                                                                        <a
                                                                            key={i}
                                                                            href={src}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 truncate"
                                                                        >
                                                                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                                                            {src}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-5 py-2 border-t border-slate-50 bg-slate-50/50">
                                        <p className="text-[9px] text-slate-400">
                                            Last updated: {new Date(item.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
