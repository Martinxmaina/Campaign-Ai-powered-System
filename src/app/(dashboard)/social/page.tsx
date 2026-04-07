"use client";

import { useEffect, useState } from "react";
import { Hash, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, Minus, Loader2 } from "lucide-react";
import { getSocialPosts } from "@/lib/supabase/queries";
import { useSocialFeed } from "@/lib/supabase/realtime";
import type { SocialPostWithRaw } from "@/lib/supabase/queries";
import { createBrowserClient } from "@supabase/ssr";

interface PlatformStat {
    name: string;
    mentions: number;
    positivePct: number;
    color: string;
}

export default function SocialListeningPage() {
    const [posts, setPosts] = useState<SocialPostWithRaw[]>([]);
    const [platforms, setPlatforms] = useState<PlatformStat[]>([]);
    const [issues, setIssues] = useState<{ topic: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const { newPosts } = useSocialFeed();

    useEffect(() => {
        async function load() {
            try {
                const data = await getSocialPosts({ limit: 100 });
                setPosts(data);

                // Aggregate platform stats
                const platformMap: Record<string, { total: number; positive: number }> = {};
                const issueMap: Record<string, number> = {};

                for (const post of data) {
                    const platform = post.raw_posts?.platform ?? "unknown";
                    if (!platformMap[platform]) platformMap[platform] = { total: 0, positive: 0 };
                    platformMap[platform].total++;
                    if (post.sentiment === "positive") platformMap[platform].positive++;

                    for (const issue of post.issues ?? []) {
                        issueMap[issue] = (issueMap[issue] ?? 0) + 1;
                    }
                }

                const platformColors: Record<string, string> = {
                    twitter: "bg-sky-500", facebook: "bg-blue-600",
                    tiktok: "bg-pink-500", instagram: "bg-violet-500",
                    youtube: "bg-red-500", news: "bg-slate-500",
                };

                const platformNames: Record<string, string> = {
                    twitter: "Twitter / X", facebook: "Facebook",
                    tiktok: "TikTok", instagram: "Instagram",
                    youtube: "YouTube", news: "News",
                };

                setPlatforms(
                    Object.entries(platformMap)
                        .map(([key, val]) => ({
                            name: platformNames[key] ?? key,
                            mentions: val.total,
                            positivePct: val.total > 0 ? Math.round((val.positive / val.total) * 100) : 0,
                            color: platformColors[key] ?? "bg-slate-400",
                        }))
                        .sort((a, b) => b.mentions - a.mentions)
                );

                setIssues(
                    Object.entries(issueMap)
                        .map(([topic, count]) => ({ topic: `#${topic.replace(/_/g, "")}`, count }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 8)
                );
            } catch (err) {
                console.error("Social load error:", err);
            }
            setLoading(false);
        }
        load();
    }, []);

    const recentMentions = posts.slice(0, 10);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-900">Social Listening</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Monitor political conversations — Ol Kalou</p>
                </div>
                {newPosts.length > 0 && (
                    <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold animate-pulse">
                        {newPosts.length} new posts
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
            ) : (
                <>
                    {/* Platform cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {platforms.length === 0 && (
                            <div className="col-span-4 text-center py-8 text-sm text-slate-400">
                                No social data yet. Posts will appear once the ingestion pipeline is running.
                            </div>
                        )}
                        {platforms.map((p) => (
                            <div key={p.name} className="stat-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-2 h-2 rounded-full ${p.color}`} />
                                    <span className="text-sm font-medium text-slate-900">{p.name}</span>
                                </div>
                                <div className="flex items-baseline gap-2 mb-3">
                                    <h3 className="text-2xl font-bold text-slate-900">{p.mentions.toLocaleString()}</h3>
                                    <span className="text-xs text-slate-500">mentions</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p.positivePct}%` }} />
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-600">{p.positivePct}%</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">positive sentiment</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Trending Issues */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-blue-600" /> Top Issues
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {issues.length === 0 && (
                                    <div className="px-6 py-8 text-center text-sm text-slate-400">No issues detected yet.</div>
                                )}
                                {issues.map((issue) => (
                                    <div key={issue.topic} className="px-6 py-3 flex items-center justify-between table-row-hover">
                                        <div>
                                            <p className="text-sm font-semibold text-blue-600">{issue.topic}</p>
                                            <p className="text-xs text-slate-500">{issue.count} mentions</p>
                                        </div>
                                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Mentions */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-blue-600" /> Recent Mentions
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {recentMentions.length === 0 && (
                                    <div className="px-6 py-8 text-center text-sm text-slate-400">No mentions yet.</div>
                                )}
                                {recentMentions.map((m) => (
                                    <div key={m.id} className="px-6 py-4 table-row-hover">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-medium text-slate-400">
                                                    {m.raw_posts?.platform}
                                                </span>
                                                <span className="text-xs font-semibold text-blue-600">
                                                    {m.raw_posts?.author ?? "Unknown"}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(m.analyzed_at ?? "").toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {m.key_insight ?? m.translation ?? m.raw_posts?.content?.slice(0, 200)}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                                m.sentiment === "positive" ? "bg-emerald-50 text-emerald-600" :
                                                m.sentiment === "negative" ? "bg-red-50 text-red-600" :
                                                "bg-amber-50 text-amber-600"
                                            }`}>
                                                {m.sentiment}
                                            </span>
                                            {(m.candidates_mentioned ?? []).map((c) => (
                                                <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
