"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft, Star, TrendingUp, TrendingDown, Minus,
    Loader2, Brain, MessageSquare, AlertTriangle, Edit2, Check, X,
    Camera, Twitter, Facebook, Instagram, Youtube, LinkIcon
} from "lucide-react";
import { authFetch } from "@/utils/supabase/auth-fetch";
import { getParty, useParties, usePartyOptions } from "@/lib/parties";
import type { Candidate } from "@/lib/supabase/queries";
import ExecutiveLineChart from "@/components/charts/ExecutiveLineChart";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

interface CandidateDetail {
    candidate: Candidate;
    history: { snapshot_at: string | null; win_prob: number | null; sentiment_positive: number | null }[];
    mentions: { id: string; key_insight: string | null; sentiment: string | null; analyzed_at: string | null; raw_posts: { platform: string | null; author: string | null; content: string | null } | null }[];
    allCandidates: { id: string; name: string; party: string | null; win_prob: number | null; is_our_candidate: boolean | null }[];
}

function renderMarkdown(text: string) {
    return text.split("\n").map((line, i) => {
        const escaped = line
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-blue-700 px-1 rounded text-xs">$1</code>');
        if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-bold text-slate-900 mt-4 mb-1 border-b pb-1 border-slate-100" dangerouslySetInnerHTML={{ __html: line.slice(3) }} />;
        if (line.startsWith("### ")) return <h3 key={i} className="text-xs font-bold text-slate-700 mt-3 mb-0.5" dangerouslySetInnerHTML={{ __html: line.slice(4) }} />;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="ml-4 text-sm text-slate-700 list-disc leading-relaxed" dangerouslySetInnerHTML={{ __html: escaped }} />;
        if (line.trim() === "") return <div key={i} className="h-1.5" />;
        return <p key={i} className="text-sm text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: escaped }} />;
    });
}

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { partyMap } = useParties();
    const partyOptions = usePartyOptions();
    const [data, setData] = useState<CandidateDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [strategy, setStrategy] = useState<string | null>(null);
    const [strategyLoading, setStrategyLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editParty, setEditParty] = useState(false);
    const [editName, setEditName] = useState(false);
    const [nameDraft, setNameDraft] = useState("");
    const [editBio, setEditBio] = useState(false);
    const [bioText, setBioText] = useState("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [editSocial, setEditSocial] = useState(false);
    const [socialDraft, setSocialDraft] = useState({
        twitter_handle: "", facebook_url: "", instagram_handle: "", youtube_url: "", tiktok_url: ""
    });

    useEffect(() => {
        authFetch(`/api/candidates/${id}`)
            .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
            .then((d) => {
                setData(d);
                setBioText(d.candidate?.bio ?? "");
                const cand = d.candidate;
                setSocialDraft({
                    twitter_handle: cand?.twitter_handle ?? "",
                    facebook_url: cand?.facebook_url ?? "",
                    instagram_handle: cand?.instagram_handle ?? "",
                    youtube_url: cand?.youtube_url ?? "",
                    tiktok_url: cand?.tiktok_url ?? "",
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    async function updateCandidate(updates: Record<string, unknown>) {
        setSaving(true);
        try {
            const res = await authFetch(`/api/candidates/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const payload = await res.json();
            if (!res.ok || !payload.candidate) {
                throw new Error(payload.error ?? "Could not update candidate");
            }
            const { candidate } = payload;
            setData((prev) => prev ? { ...prev, candidate } : prev);
        } finally {
            setSaving(false);
        }
    }

    async function markAsOurs() {
        await updateCandidate({ is_our_candidate: true });
        // Update allCandidates list too
        setData((prev) => prev ? {
            ...prev,
            allCandidates: prev.allCandidates.map((c) => ({ ...c, is_our_candidate: c.id === id })),
        } : prev);
    }

    async function generateStrategy() {
        setStrategyLoading(true);
        setStrategy(null);
        try {
            const res = await authFetch(`/api/candidates/${id}/strategy`, { method: "POST" });
            const { strategy: s } = await res.json();
            setStrategy(s);
        } finally {
            setStrategyLoading(false);
        }
    }

    async function uploadPhoto(file: File) {
        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await authFetch(`/api/candidates/${id}/photo`, { method: "POST", body: formData });
            const payload = await res.json();
            if (!res.ok) {
                throw new Error(payload.error ?? "Photo upload failed");
            }
            const { photo_url, updated_at } = payload;
            if (photo_url) {
                setData((prev) => prev ? {
                    ...prev,
                    candidate: {
                        ...prev.candidate,
                        photo_url,
                        updated_at: updated_at ?? prev.candidate.updated_at,
                    },
                } : prev);
            }
        } catch (err) {
            console.error("Photo upload failed:", err);
        }
        setUploadingPhoto(false);
    }

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
    );

    if (!data || !(data as CandidateDetail).candidate) return (
        <div className="p-6 text-center text-slate-400">Candidate not found.</div>
    );

    const { candidate: c, history, mentions, allCandidates, intel } = data as CandidateDetail & { intel?: { social_media_followers?: Record<string, number> | null } | null };
    const party = getParty(c.party, partyMap);
    const photoUrl = c.photo_url
        ? `${c.photo_url}${c.photo_url.includes("?") ? "&" : "?"}v=${encodeURIComponent(c.updated_at ?? "")}`
        : null;

    const historyChartData = history.map((h, i) => ({
        label: `D${i + 1}`,
        win_prob: Number(h.win_prob ?? 0),
        sentiment: Number(h.sentiment_positive ?? 0),
    }));

    const sentimentData = [
        { name: "Positive", value: c.sentiment_positive ?? 0, color: "#10b981" },
        { name: "Neutral", value: c.sentiment_neutral ?? 0, color: "#94a3b8" },
        { name: "Negative", value: c.sentiment_negative ?? 0, color: "#ef4444" },
    ];

    // Social media followers chart
    const socialFollowers = intel?.social_media_followers;
    const socialChartData = socialFollowers
        ? Object.entries(socialFollowers)
            .filter(([, v]) => Number(v) > 0)
            .map(([platform, count]) => ({ platform: platform.charAt(0).toUpperCase() + platform.slice(1), followers: Number(count) }))
            .sort((a, b) => b.followers - a.followers)
        : [];

    // Comparison bar chart
    const comparisonData = allCandidates.map((x) => ({
        name: x.name.split(" ")[0],
        value: Number(x.win_prob ?? 0),
        isOurs: x.is_our_candidate,
        isCurrent: x.id === id,
    }));

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl">
            {/* Back nav */}
            <button
                onClick={() => router.push("/candidates")}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> All Candidates
            </button>

            {/* Candidate Header */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Photo / Avatar with upload */}
                    <label className="relative w-16 h-16 rounded-2xl shrink-0 cursor-pointer group">
                        {photoUrl ? (
                            <Image
                                key={photoUrl}
                                src={photoUrl}
                                alt={c.name}
                                width={64}
                                height={64}
                                unoptimized
                                className="w-16 h-16 rounded-2xl object-cover"
                            />
                        ) : (
                            <div className={`w-16 h-16 rounded-2xl ${c.is_our_candidate ? "bg-blue-600" : "bg-slate-700"} flex items-center justify-center`}>
                                <span className="text-xl font-black text-white">
                                    {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {uploadingPhoto ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }}
                        />
                    </label>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            {editName ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <input
                                        value={nameDraft}
                                        onChange={(e) => setNameDraft(e.target.value)}
                                        className="text-xl font-black text-slate-900 border border-blue-400 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                        autoFocus
                                        onKeyDown={async (e) => {
                                            if (e.key === "Enter" && nameDraft.trim()) {
                                                setEditName(false);
                                                await updateCandidate({ name: nameDraft.trim() });
                                            } else if (e.key === "Escape") {
                                                setEditName(false);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={async () => { if (nameDraft.trim()) { setEditName(false); await updateCandidate({ name: nameDraft.trim() }); } }}
                                        className="p-1 text-blue-600 hover:text-blue-700"
                                    ><Check className="h-4 w-4" /></button>
                                    <button onClick={() => setEditName(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group/name">
                                    <h1 className="text-2xl font-black text-slate-900">{c.name}</h1>
                                    <button
                                        onClick={() => { setNameDraft(c.name); setEditName(true); }}
                                        className="opacity-0 group-hover/name:opacity-100 transition-opacity text-slate-400 hover:text-blue-500"
                                    ><Edit2 className="h-3.5 w-3.5" /></button>
                                </div>
                            )}
                            {c.is_our_candidate && (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                                    <Star className="h-3 w-3 fill-blue-500" /> OUR CANDIDATE
                                </span>
                            )}
                        </div>

                        {/* Party badge + selector */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: party.hexColor }}>
                                {party.name}
                            </span>
                            {editParty ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {partyOptions.map((p) => {
                                        const pt = getParty(p, partyMap);
                                        return (
                                            <button
                                                key={p}
                                                onClick={async () => {
                                                    setEditParty(false);
                                                    await updateCandidate({ party: p });
                                                }}
                                                className="text-xs font-bold px-2.5 py-1 rounded-full text-white hover:opacity-80 transition-opacity"
                                                style={{ backgroundColor: pt.hexColor }}
                                            >
                                                {pt.shortName}
                                            </button>
                                        );
                                    })}
                                    <button onClick={() => setEditParty(false)} className="text-xs text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                                </div>
                            ) : (
                                <button onClick={() => setEditParty(true)} className="text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1 transition-colors">
                                    <Edit2 className="h-3 w-3" /> Change party
                                </button>
                            )}
                        </div>

                        {/* Constituency + threat */}
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span>📍 {c.constituency ?? "Ol Kalou"}</span>
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${
                                c.threat_level === "high" ? "bg-red-50 text-red-600" :
                                c.threat_level === "medium" ? "bg-amber-50 text-amber-600" :
                                "bg-emerald-50 text-emerald-600"
                            }`}>
                                {c.threat_level ?? "low"} threat
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                                c.momentum === "rising" ? "bg-emerald-50 text-emerald-600" :
                                c.momentum === "declining" ? "bg-red-50 text-red-600" :
                                "bg-slate-100 text-slate-500"
                            }`}>
                                {c.momentum === "rising" ? <TrendingUp className="h-3 w-3" /> : c.momentum === "declining" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                {c.momentum ?? "stable"}
                            </span>
                        </div>
                    </div>

                    {/* Mark as ours button */}
                    {!c.is_our_candidate && (
                        <button
                            onClick={markAsOurs}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 self-start sm:self-auto w-full sm:w-auto justify-center"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                            Mark as Our Candidate
                        </button>
                    )}
                </div>

                {/* Social media handles */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-700">Social media</p>
                        <button onClick={() => setEditSocial((v) => !v)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 transition-colors">
                            <Edit2 className="h-3 w-3" /> {editSocial ? "Done" : "Edit"}
                        </button>
                    </div>
                    {editSocial ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                { key: "twitter_handle", label: "Twitter/X handle", placeholder: "@kamausammy" },
                                { key: "facebook_url", label: "Facebook URL", placeholder: "https://facebook.com/..." },
                                { key: "instagram_handle", label: "Instagram handle", placeholder: "@kamausammy" },
                                { key: "youtube_url", label: "YouTube URL", placeholder: "https://youtube.com/@..." },
                                { key: "tiktok_url", label: "TikTok URL", placeholder: "https://tiktok.com/@..." },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <label className="text-[10px] text-slate-500 block mb-0.5">{label}</label>
                                    <input
                                        value={socialDraft[key as keyof typeof socialDraft]}
                                        onChange={(e) => setSocialDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                                        placeholder={placeholder}
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            ))}
                            <div className="sm:col-span-2">
                                <button
                                    onClick={async () => {
                                        setEditSocial(false);
                                        await updateCandidate(socialDraft);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Check className="h-3.5 w-3.5" /> Save social links
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {c.twitter_handle && (
                                <a href={`https://twitter.com/${c.twitter_handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                                    <Twitter className="h-3.5 w-3.5 text-sky-500" /> {c.twitter_handle}
                                </a>
                            )}
                            {c.facebook_url && (
                                <a href={c.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                                    <Facebook className="h-3.5 w-3.5 text-blue-600" /> Facebook
                                </a>
                            )}
                            {c.instagram_handle && (
                                <a href={`https://instagram.com/${c.instagram_handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                                    <Instagram className="h-3.5 w-3.5 text-pink-500" /> {c.instagram_handle}
                                </a>
                            )}
                            {c.youtube_url && (
                                <a href={c.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                                    <Youtube className="h-3.5 w-3.5 text-red-500" /> YouTube
                                </a>
                            )}
                            {c.tiktok_url && (
                                <a href={c.tiktok_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                                    <LinkIcon className="h-3.5 w-3.5" /> TikTok
                                </a>
                            )}
                            {!c.twitter_handle && !c.facebook_url && !c.instagram_handle && !c.youtube_url && !c.tiktok_url && (
                                <p className="text-xs text-slate-400 italic">No social links yet. Click edit to add.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Bio */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    {editBio ? (
                        <div className="space-y-2">
                            <textarea
                                value={bioText}
                                onChange={(e) => setBioText(e.target.value)}
                                rows={3}
                                className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-none"
                                placeholder="Add background information about this candidate..."
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        setEditBio(false);
                                        await updateCandidate({ bio: bioText });
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Check className="h-3.5 w-3.5" /> Save
                                </button>
                                <button onClick={() => setEditBio(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between gap-4">
                            <p className="text-sm text-slate-600 leading-relaxed flex-1">
                                {c.bio || <span className="italic text-slate-400">No background information yet. Click edit to add.</span>}
                            </p>
                            <button onClick={() => setEditBio(true)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 shrink-0 transition-colors">
                                <Edit2 className="h-3.5 w-3.5" /> Edit bio
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Win Probability", value: `${c.win_prob ?? 0}%`, sub: "Current estimate", color: "text-blue-600" },
                    { label: "Positive Sentiment", value: `${c.sentiment_positive ?? 0}%`, sub: "Social media", color: "text-emerald-600" },
                    { label: "Negative Sentiment", value: `${c.sentiment_negative ?? 0}%`, sub: "Social media", color: "text-red-500" },
                    { label: "7-Day Mentions", value: String(c.mention_count_7d ?? 0), sub: "All platforms", color: "text-violet-600" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs font-semibold text-slate-700 mt-1">{stat.label}</p>
                        <p className="text-[10px] text-slate-400">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Win probability chart */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Win Probability Trend</h3>
                    {historyChartData.length > 0 ? (
                        <ExecutiveLineChart
                            title=""
                            subtitle="Last 30 days"
                            data={historyChartData}
                            xKey="label"
                            series={[
                                { dataKey: "win_prob", label: "Win Prob %", color: "#2563eb" },
                                { dataKey: "sentiment", label: "Sentiment %", color: "#10b981" },
                            ]}
                            showHeader={false}
                            height={200}
                        />
                    ) : (
                        <div className="h-48 flex items-center justify-center text-sm text-slate-400">
                            No historical data yet. Will populate once analysis pipeline runs.
                        </div>
                    )}
                </div>

                {/* Sentiment breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Sentiment Breakdown</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sentimentData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                                    formatter={(v) => [`${v}%`, ""]}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {sentimentData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Social Media Followers */}
            {socialChartData.length > 0 && (
                <div className="bg-white rounded-xl border border-[#EAEAEA] p-5">
                    <h3 className="text-sm font-semibold text-[#111111] mb-4">Social Media Followers by Platform</h3>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={socialChartData} margin={{ left: -8, right: 8 }}>
                                <XAxis dataKey="platform" tick={{ fontSize: 10, fill: "#B0ADAA" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#B0ADAA" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ border: "1px solid #EAEAEA", borderRadius: 6, fontSize: 11, boxShadow: "none" }}
                                    formatter={(v) => [Number(v).toLocaleString(), "Followers"]}
                                    cursor={{ fill: "rgba(0,0,0,0.02)" }}
                                />
                                <Bar dataKey="followers" radius={[3, 3, 0, 0]}>
                                    {socialChartData.map((entry, i) => {
                                        const colors: Record<string, string> = { Twitter: "#1DA1F2", Facebook: "#1877F2", Instagram: "#E1306C", Youtube: "#FF0000", Tiktok: "#111111" };
                                        return <Cell key={i} fill={colors[entry.platform] ?? "#B0ADAA"} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                        <span className="text-[10px] text-[#787774]">
                            Total: {socialChartData.reduce((s, d) => s + d.followers, 0).toLocaleString()} followers across {socialChartData.length} platform{socialChartData.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            )}

            {/* Head-to-head comparison */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Head-to-Head Comparison — All Candidates
                </h3>
                <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                                formatter={(v) => [`${v}%`, "Win Probability"]}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {comparisonData.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={entry.isCurrent ? "#2563eb" : entry.isOurs ? "#10b981" : "#94a3b8"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded mr-1" />Current candidate&nbsp;&nbsp;
                    <span className="inline-block w-2 h-2 bg-emerald-500 rounded mr-1" />Our candidate&nbsp;&nbsp;
                    <span className="inline-block w-2 h-2 bg-slate-400 rounded mr-1" />Opponents
                </p>
            </div>

            {/* AI Strategy */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-violet-600" />
                        <h3 className="text-sm font-semibold text-slate-900">AI Strategic Intelligence</h3>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Powered by Claude</span>
                    </div>
                    <button
                        onClick={generateStrategy}
                        disabled={strategyLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
                    >
                        {strategyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                        {strategyLoading ? "Analysing..." : strategy ? "Regenerate" : "Generate Strategy"}
                    </button>
                </div>

                <div className="p-6">
                    {!strategy && !strategyLoading && (
                        <div className="text-center py-8">
                            <Brain className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 mb-1">No strategy generated yet</p>
                            <p className="text-xs text-slate-400">Click &quot;Generate Strategy&quot; for a full intelligence report:<br />strengths, vulnerabilities, counter-tactics, and 3D political chess moves.</p>
                        </div>
                    )}
                    {strategyLoading && (
                        <div className="flex items-center justify-center py-12 gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                            <span className="text-sm text-slate-500">Analysing political landscape for {c.name}...</span>
                        </div>
                    )}
                    {strategy && (
                        <div className="prose prose-sm max-w-none space-y-0.5">
                            {renderMarkdown(strategy)}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Mentions */}
            {mentions.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <h3 className="text-sm font-semibold text-slate-900">Recent Social Mentions</h3>
                        <span className="text-xs text-slate-400 ml-auto">{mentions.length} mentions</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {mentions.slice(0, 10).map((m) => (
                            <div key={m.id} className="px-6 py-4">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-medium text-slate-400">{m.raw_posts?.platform} · {m.raw_posts?.author ?? "Unknown"}</span>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                        m.sentiment === "positive" ? "bg-emerald-50 text-emerald-600" :
                                        m.sentiment === "negative" ? "bg-red-50 text-red-600" :
                                        "bg-slate-100 text-slate-500"
                                    }`}>{m.sentiment}</span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {m.key_insight ?? m.raw_posts?.content?.slice(0, 180)}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">{m.analyzed_at ? new Date(m.analyzed_at).toLocaleString() : "—"}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {mentions.length === 0 && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-400">
                    No social mentions yet for {c.name}. Mentions will appear once the ingestion pipeline is running.
                </div>
            )}
        </div>
    );
}
