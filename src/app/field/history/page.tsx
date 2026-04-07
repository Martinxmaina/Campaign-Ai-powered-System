"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, CloudOff, CheckCircle2, RefreshCw, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPendingReports, removeQueuedReport, flushQueue, type QueuedReport } from "@/lib/field/offline-sync";
import { createBrowserClient } from "@supabase/ssr";
import { tr, type Lang } from "@/lib/field/i18n";
import type { FieldReport } from "@/lib/supabase/queries";

const REPORT_TYPE_LABELS: Record<string, { sw: string; en: string; emoji: string }> = {
    voter_sentiment:    { sw: "Hisia",        en: "Sentiment",  emoji: "🗳️" },
    opposition_sighting:{ sw: "Upinzani",     en: "Opposition", emoji: "👁️" },
    event_attended:     { sw: "Tukio",        en: "Event",      emoji: "📢" },
    voter_contact:      { sw: "Mawasiliano",  en: "Contact",    emoji: "🤝" },
    alert:              { sw: "Tahadhari",    en: "Alert",      emoji: "⚠️" },
};

const MOOD_EMOJIS = ["😠", "😕", "😐", "🙂", "😊"];

function timeLabel(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function FieldHistoryPage() {
    const [lang, setLang] = useState<Lang>("sw");
    const [pending, setPending] = useState<QueuedReport[]>([]);
    const [synced, setSynced] = useState<FieldReport[]>([]);
    const [flushing, setFlushing] = useState(false);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        setLoading(true);
        try {
            const [q, supabase] = [
                await getPendingReports(),
                createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                ),
            ];
            setPending(q);
            const { data } = await supabase
                .from("field_reports")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(30);
            setSynced(data ?? []);
        } catch { /* offline */ }
        setLoading(false);
    }, []);

    useEffect(() => { reload(); }, [reload]);

    async function handleFlush() {
        setFlushing(true);
        await flushQueue();
        setFlushing(false);
        await reload();
    }

    async function handleDelete(id: string) {
        await removeQueuedReport(id);
        setPending((prev) => prev.filter((r) => r.id !== id));
    }

    function rtLabel(type: string) {
        const entry = REPORT_TYPE_LABELS[type];
        if (!entry) return type;
        return `${entry.emoji} ${lang === "sw" ? entry.sw : entry.en}`;
    }

    return (
        <div className="p-4 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                    <Link href="/field" className="p-1.5 rounded-lg hover:bg-slate-100">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900">{tr("history", lang)}</h1>
                </div>
                <button
                    onClick={() => setLang(lang === "sw" ? "en" : "sw")}
                    className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-600 font-medium"
                >
                    {lang === "sw" ? "EN" : "SW"}
                </button>
            </div>

            {/* Pending queue section */}
            {pending.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between border-b border-amber-200">
                        <div className="flex items-center gap-2">
                            <CloudOff className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-800">
                                {pending.length} {lang === "sw" ? "zinasubiri" : "pending sync"}
                            </span>
                        </div>
                        <button
                            onClick={handleFlush}
                            disabled={flushing || !navigator.onLine}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
                        >
                            <RefreshCw className={`h-3 w-3 ${flushing ? "animate-spin" : ""}`} />
                            {flushing ? (lang === "sw" ? "Inatuma..." : "Syncing...") : (lang === "sw" ? "Tuma Sasa" : "Sync Now")}
                        </button>
                    </div>
                    <div className="divide-y divide-amber-100">
                        {pending.map((r) => {
                            const d = r.data;
                            return (
                                <div key={r.id} className="px-4 py-3 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-semibold text-amber-900">
                                                {d.ward as string ?? "—"}
                                            </span>
                                            {d.location != null && (
                                                <span className="text-[10px] text-amber-600">· {String(d.location)}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="text-[10px] text-amber-700">
                                                {rtLabel(d.report_type as string ?? "")}
                                            </span>
                                            {d.mood_score != null && (
                                                <span className="text-sm">{MOOD_EMOJIS[(d.mood_score as number) - 1]}</span>
                                            )}
                                        </div>
                                        {d.notes != null && (
                                            <p className="text-[10px] text-amber-600 mt-0.5 truncate max-w-[200px]">
                                                {String(d.notes)}
                                            </p>
                                        )}
                                        <span className="text-[9px] text-amber-500 mt-0.5 block">{timeLabel(r.queuedAt)}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        className="shrink-0 p-1.5 rounded-lg hover:bg-amber-100 text-amber-500 active:scale-90 transition-transform"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Synced reports */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <RefreshCw className="h-5 w-5 text-slate-400 animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-sm font-semibold text-slate-900">
                            {lang === "sw" ? "Ripoti zilizotumwa" : "Submitted Reports"}
                        </h3>
                    </div>
                    {synced.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <Clock className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-xs text-slate-400">
                                {lang === "sw" ? "Hakuna ripoti bado." : "No reports submitted yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {synced.map((r) => (
                                <div key={r.id} className="px-4 py-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-semibold text-slate-800">{r.ward}</span>
                                                {r.location && (
                                                    <span className="text-[10px] text-slate-400">· {r.location}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="text-[10px] text-slate-500">
                                                    {rtLabel(r.report_type)}
                                                </span>
                                                {r.mood_score && (
                                                    <span className="text-sm">{MOOD_EMOJIS[r.mood_score - 1]}</span>
                                                )}
                                                {r.priority === "high" && (
                                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-red-50 text-red-500 rounded-full">HIGH</span>
                                                )}
                                            </div>
                                            {r.notes && (
                                                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[220px]">{r.notes}</p>
                                            )}
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="text-[9px] text-slate-400 block">
                                                {timeLabel(r.created_at ?? "")}
                                            </span>
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-1 ml-auto" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
