"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Camera, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { submitFieldReport } from "@/lib/field/offline-sync";
import { tr, CONSTITUENCIES, CONSTITUENCY_WARDS, POLLING_STATIONS, type Lang } from "@/lib/field/i18n";
import { createBrowserClient } from "@supabase/ssr";
import type { Candidate } from "@/lib/supabase/queries";

type ReportType = "voter_sentiment" | "opposition_sighting" | "event_attended" | "voter_contact" | "alert";

const REPORT_TYPES: { type: ReportType; emoji: string; sw: string; en: string }[] = [
    { type: "voter_sentiment",    emoji: "🗳️", sw: "Hisia",       en: "Sentiment" },
    { type: "opposition_sighting",emoji: "👁️", sw: "Upinzani",    en: "Opposition" },
    { type: "event_attended",     emoji: "📢", sw: "Tukio",        en: "Event" },
    { type: "voter_contact",      emoji: "🤝", sw: "Mawasiliano", en: "Contact" },
    { type: "alert",              emoji: "⚠️", sw: "Tahadhari",   en: "Alert" },
];

const MOOD_EMOJIS = ["😠", "😕", "😐", "🙂", "😊"];

export default function FieldReportPage() {
    const router = useRouter();
    const [lang, setLang] = useState<Lang>("sw");
    const [candidates, setCandidates] = useState<Candidate[]>([]);

    // Form state
    const [constituency, setConstituency] = useState("");
    const [ward, setWard] = useState("");
    const [location, setLocation] = useState("");
    const [reportType, setReportType] = useState<ReportType | null>(null);
    const [candidateId, setCandidateId] = useState("");
    const [mood, setMood] = useState<number | null>(null);
    const [notes, setNotes] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [wasQueued, setWasQueued] = useState(false);

    // Voice recording
    const [recording, setRecording] = useState(false);
    const recognitionRef = useRef<unknown>(null);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        supabase.from("candidates").select("*").order("is_our_candidate", { ascending: false })
            .then(({ data }) => setCandidates((data ?? []) as Candidate[]));
    }, []);

    function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
    }

    function toggleVoice() {
        const SpeechRecognition =
            (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
            (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Voice recognition not supported on this browser.");
            return;
        }

        if (recording) {
            (recognitionRef.current as { stop: () => void })?.stop();
            setRecording(false);
            return;
        }

        const recognition = new (SpeechRecognition as new () => {
            lang: string;
            continuous: boolean;
            interimResults: boolean;
            start: () => void;
            stop: () => void;
            onresult: (e: { results: { transcript: string }[][] }) => void;
            onend: () => void;
        })();
        recognition.lang = lang === "sw" ? "sw-KE" : "en-KE";
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = (e) => {
            const transcript = e.results[e.results.length - 1][0].transcript;
            setNotes((prev) => prev + (prev ? " " : "") + transcript);
        };
        recognition.onend = () => setRecording(false);
        recognition.start();
        recognitionRef.current = recognition;
        setRecording(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!constituency || !ward || !reportType) return;

        setSubmitting(true);

        // Get current user
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { user } } = await supabase.auth.getUser();

        const reportData: Record<string, unknown> = {
            constituency: constituency || null,
            ward,
            location: location || null,
            report_type: reportType,
            candidate_id: candidateId || null,
            mood_score: mood,
            notes: notes || null,
            priority: reportType === "alert" ? "high" : "normal",
            is_synced: false,
            agent_id: user?.id ?? null,
        };

        const result = await submitFieldReport(reportData);
        setSubmitting(false);
        setSubmitted(true);
        setWasQueued(result.queued);

        setTimeout(() => router.push("/field"), 2500);
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-900">
                    {wasQueued ? tr("savedOffline", lang) : tr("submitted", lang)}
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    {wasQueued ? "Itawasilishwa mtandao utakapowaka." : ""}
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                    <Link href="/field" className="p-1.5 rounded-lg hover:bg-slate-100">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900">{tr("submitReport", lang)}</h1>
                </div>
                <button
                    onClick={() => setLang(lang === "sw" ? "en" : "sw")}
                    className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-600 font-medium"
                >
                    {lang === "sw" ? "EN" : "SW"}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Ward */}
                {/* Constituency */}
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">{tr("constituency", lang)} *</label>
                    <select
                        value={constituency}
                        onChange={(e) => { setConstituency(e.target.value); setWard(""); setLocation(""); }}
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                    >
                        <option value="">{tr("selectConstituency", lang)}</option>
                        {CONSTITUENCIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* Ward — filtered by constituency */}
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">{tr("ward", lang)} *</label>
                    <select
                        value={ward}
                        onChange={(e) => { setWard(e.target.value); setLocation(""); }}
                        required
                        disabled={!constituency}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">{constituency ? tr("selectWard", lang) : tr("selectConstituencyFirst", lang)}</option>
                        {constituency && (CONSTITUENCY_WARDS[constituency as keyof typeof CONSTITUENCY_WARDS] ?? []).map((w) => (
                            <option key={w} value={w}>{w}</option>
                        ))}
                    </select>
                </div>

                {/* Polling Station — filtered by ward */}
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">{tr("location", lang)}</label>
                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={!ward}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">{ward ? tr("selectStation", lang) : tr("selectWardFirst", lang)}</option>
                        {ward && (POLLING_STATIONS[ward] ?? []).map((station) => (
                            <option key={station} value={station}>{station}</option>
                        ))}
                    </select>
                </div>

                {/* Report Type */}
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">{tr("reportType", lang)} *</label>
                    <div className="grid grid-cols-5 gap-2">
                        {REPORT_TYPES.map(({ type, emoji, sw, en }) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setReportType(type)}
                                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all text-center ${
                                    reportType === type
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                            >
                                <span className="text-2xl">{emoji}</span>
                                <span className="text-[9px] font-medium text-slate-600 mt-1 leading-tight">
                                    {lang === "sw" ? sw : en}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Candidate */}
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">{tr("candidate", lang)}</label>
                    <select
                        value={candidateId}
                        onChange={(e) => setCandidateId(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                    >
                        <option value="">{tr("selectCandidate", lang)}</option>
                        {candidates.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name} {c.is_our_candidate ? "★" : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mood */}
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">{tr("mood", lang)}</label>
                    <div className="flex gap-3 justify-center">
                        {MOOD_EMOJIS.map((emoji, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setMood(i + 1)}
                                className={`text-3xl p-2 rounded-xl transition-all ${
                                    mood === i + 1
                                        ? "bg-blue-50 border-2 border-blue-400 scale-110"
                                        : "border-2 border-transparent hover:bg-slate-50"
                                }`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes + voice */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-600">{tr("notes", lang)}</label>
                        <button
                            type="button"
                            onClick={toggleVoice}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                                recording
                                    ? "bg-red-50 text-red-600 border border-red-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                        >
                            {recording ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                            {recording ? "Stop" : tr("voiceNote", lang)}
                        </button>
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-none"
                        placeholder={lang === "sw" ? "Andika maelezo hapa..." : "Add notes here..."}
                    />
                </div>

                {/* Photo */}
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">{tr("photo", lang)}</label>
                    <label className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-colors">
                        <Camera className="h-4 w-4" />
                        {photoFile ? photoFile.name : (lang === "sw" ? "Chukua picha" : "Take photo")}
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                    </label>
                    {photoPreview && (
                        <Image src={photoPreview} alt="Preview" width={400} height={128} unoptimized className="mt-2 rounded-xl w-full h-32 object-cover" />
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting || !constituency || !ward || !reportType}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-base hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                    {submitting ? tr("submitting", lang) : tr("submitReport", lang)}
                </button>
            </form>
        </div>
    );
}
