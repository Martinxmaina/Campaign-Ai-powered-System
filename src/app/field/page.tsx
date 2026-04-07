"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, AlertTriangle, TrendingUp, Wifi, WifiOff } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { getPendingReports } from "@/lib/field/offline-sync";
import { tr, type Lang } from "@/lib/field/i18n";
import type { Candidate, WarRoomAlert, FieldReport } from "@/lib/supabase/queries";

export default function FieldHomePage() {
    const [lang, setLang] = useState<Lang>("sw");
    const [online, setOnline] = useState(() => typeof window !== "undefined" ? navigator.onLine : true);
    const [pendingCount, setPendingCount] = useState(0);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [alerts, setAlerts] = useState<WarRoomAlert[]>([]);
    const [myReports, setMyReports] = useState<FieldReport[]>([]);

    useEffect(() => {
        const onOnline = () => setOnline(true);
        const onOffline = () => setOnline(false);
        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);
        return () => {
            window.removeEventListener("online", onOnline);
            window.removeEventListener("offline", onOffline);
        };
    }, []);

    useEffect(() => {
        getPendingReports().then((q) => setPendingCount(q.length));
    }, []);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        Promise.all([
            supabase.from("candidates").select("*").order("win_prob", { ascending: false }),
            supabase.from("war_room_alerts").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(3),
            supabase.from("field_reports").select("*").order("created_at", { ascending: false }).limit(10),
        ]).then(([c, a, r]) => {
            setCandidates(c.data ?? []);
            setAlerts(a.data ?? []);
            setMyReports(r.data ?? []);
        }).catch(console.error);
    }, []);

    const reportTypeLabel: Record<string, string> = {
        voter_sentiment: "Hisia",
        opposition_sighting: "Upinzani",
        event_attended: "Tukio",
        voter_contact: "Mawasiliano",
        alert: "Tahadhari",
    };

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pt-2">
                <div>
                    <h1 className="text-lg font-bold text-slate-900">{tr("appTitle", lang)}</h1>
                    <p className="text-xs text-slate-500">Ol Kalou 2026</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLang(lang === "sw" ? "en" : "sw")}
                        className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-600 font-medium"
                    >
                        {lang === "sw" ? "EN" : "SW"}
                    </button>
                    <div className={`flex items-center gap-1 text-xs font-medium ${online ? "text-emerald-600" : "text-red-500"}`}>
                        {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                    </div>
                </div>
            </div>

            {/* Offline / sync banner */}
            {!online && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium flex items-center gap-2">
                    <WifiOff className="h-4 w-4 shrink-0" />
                    Bila mtandao — ripoti zitahifadhiwa hapa
                </div>
            )}
            {pendingCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 font-medium">
                    {tr("syncPending", lang)}: {pendingCount}
                </div>
            )}

            {/* Quick action */}
            <Link
                href="/field/report"
                className="block bg-blue-600 text-white rounded-2xl p-5 text-center shadow-md active:scale-95 transition-transform"
            >
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p className="font-bold text-lg">{tr("submitReport", lang)}</p>
            </Link>

            {/* Candidate standings */}
            {candidates.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-slate-900">{tr("wardStandings", lang)}</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {candidates.map((c) => (
                            <div key={c.id} className="px-4 py-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-slate-900">
                                        {c.name} {c.is_our_candidate && "★"}
                                    </span>
                                    <span className="text-xs font-bold text-blue-600">{c.win_prob}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${c.is_our_candidate ? "bg-blue-600" : "bg-slate-400"}`}
                                        style={{ width: `${c.win_prob}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active alerts */}
            {alerts.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <h3 className="text-sm font-semibold text-slate-900">{tr("recentAlerts", lang)}</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {alerts.map((a) => (
                            <div key={a.id} className="px-4 py-3">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mr-2 ${
                                    a.severity === "critical" ? "bg-red-50 text-red-600" :
                                    a.severity === "high" ? "bg-amber-50 text-amber-600" :
                                    "bg-blue-50 text-blue-600"
                                }`}>
                                    {a.severity}
                                </span>
                                <span className="text-xs text-slate-700">{a.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent reports */}
            {myReports.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-900">{tr("myReports", lang)}</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {myReports.slice(0, 5).map((r) => (
                            <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-medium text-slate-700">{r.ward}</span>
                                    <span className="text-[10px] text-slate-400 ml-2">{reportTypeLabel[r.report_type] ?? r.report_type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {r.mood_score && (
                                        <span className="text-sm">{["😠","😕","😐","🙂","😊"][r.mood_score - 1]}</span>
                                    )}
                                    {!r.is_synced && <span className="text-[10px] text-amber-500">●</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
