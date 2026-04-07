"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const OL_KALOU_WARDS = ["Karandi", "Mirangine", "Gathanji", "Gatimu", "Rurii"];

const INTEL_TYPES = [
    { value: "opposition_research", label: "Opposition Research" },
    { value: "voter_pulse", label: "Voter Pulse" },
    { value: "event_debrief", label: "Event Debrief" },
    { value: "rumor_tracking", label: "Rumor / Narrative Tracking" },
    { value: "media_analysis", label: "Media Analysis" },
    { value: "coalition_intel", label: "Coalition Intelligence" },
];

interface Candidate {
    id: string;
    name: string;
    party: string;
}

type FieldName =
    | "intelType"
    | "ward"
    | "candidateId"
    | "summary"
    | "detailedNotes"
    | "recommendation";

type FieldKind = "segmented" | "select" | "text" | "textarea";

interface FieldOption {
    value: string;
    label: string;
}

interface FieldConfig {
    name: FieldName;
    label: string;
    placeholder?: string;
    required: boolean;
    kind: FieldKind;
    options?: FieldOption[];
}

const FIELD_CONFIGS: FieldConfig[] = [
    {
        name: "intelType",
        label: "Intelligence Type",
        required: true,
        kind: "segmented",
        options: INTEL_TYPES,
    },
    {
        name: "ward",
        label: "Ward",
        placeholder: "Select ward",
        required: true,
        kind: "select",
        options: OL_KALOU_WARDS.map((ward) => ({ value: ward, label: ward })),
    },
    {
        name: "candidateId",
        label: "Candidate",
        placeholder: "Select candidate (optional)",
        required: false,
        kind: "select",
    },
    {
        name: "summary",
        label: "Headline",
        placeholder: "What happened?",
        required: false,
        kind: "text",
    },
    {
        name: "detailedNotes",
        label: "Notes",
        placeholder: "Add the key facts, who was involved, where it happened, and why it matters.",
        required: false,
        kind: "textarea",
    },
    {
        name: "recommendation",
        label: "Recommendation",
        placeholder: "What should the team do next?",
        required: false,
        kind: "textarea",
    },
];

const INTEL_DB = "votercore-offline";
const INTEL_STORE = "pending_intel";

async function getPendingCount(): Promise<number> {
    return new Promise((resolve) => {
        try {
            const req = indexedDB.open(INTEL_DB, 1);
            req.onsuccess = (e) => {
                const db = (e.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(INTEL_STORE)) {
                    resolve(0);
                    return;
                }

                const tx = db.transaction(INTEL_STORE, "readonly");
                const countReq = tx.objectStore(INTEL_STORE).count();
                countReq.onsuccess = () => resolve(countReq.result);
                countReq.onerror = () => resolve(0);
            };
            req.onerror = () => resolve(0);
        } catch {
            resolve(0);
        }
    });
}

export default function IntelFormPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedOffline, setSubmittedOffline] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [syncing, setSyncing] = useState(false);

    const [intelType, setIntelType] = useState("");
    const [ward, setWard] = useState("");
    const [candidateId, setCandidateId] = useState("");
    const [summary, setSummary] = useState("");
    const [detailedNotes, setDetailedNotes] = useState("");
    const [recommendation, setRecommendation] = useState("");

    const refreshPending = useCallback(async () => {
        const count = await getPendingCount();
        setPendingCount(count);
    }, []);

    const manualSync = useCallback(async () => {
        if (!navigator.onLine) return;

        setSyncing(true);
        try {
            if ("serviceWorker" in navigator && "SyncManager" in window) {
                const reg = await navigator.serviceWorker.ready;
                await (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-intel-reports");
            }
            setTimeout(refreshPending, 2000);
        } catch {
            // Service worker sync is optional in some browsers.
        } finally {
            setSyncing(false);
        }
    }, [refreshPending]);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        refreshPending();

        const online = () => {
            setIsOnline(true);
            manualSync();
        };
        const offline = () => setIsOnline(false);

        window.addEventListener("online", online);
        window.addEventListener("offline", offline);

        const swHandler = (e: MessageEvent) => {
            if (e.data?.type === "INTEL_SYNC_DONE") refreshPending();
        };

        navigator.serviceWorker?.addEventListener("message", swHandler);

        const supabase = createClient();
        supabase
            .from("candidates")
            .select("id, name, party")
            .order("is_our_candidate", { ascending: false })
            .then(({ data }: { data: unknown[] | null }) => setCandidates((data ?? []) as Candidate[]));

        return () => {
            window.removeEventListener("online", online);
            window.removeEventListener("offline", offline);
            navigator.serviceWorker?.removeEventListener("message", swHandler);
        };
    }, [manualSync, refreshPending]);

    function resetForm() {
        setIntelType("");
        setWard("");
        setCandidateId("");
        setSummary("");
        setDetailedNotes("");
        setRecommendation("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!intelType || !ward) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/research-intel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ward,
                    report_type: intelType,
                    candidate_id: candidateId || null,
                    mood_score: null,
                    priority: "normal",
                    intel_type: intelType,
                    source_type: null,
                    source_credibility: null,
                    classification: null,
                    intelligence_summary: summary || null,
                    detailed_notes: detailedNotes || null,
                    actionable_recommendation: recommendation || null,
                    source_language: null,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (data.queued || res.status === 202) {
                setSubmittedOffline(true);
                refreshPending();
                resetForm();
                setTimeout(() => setSubmittedOffline(false), 3000);
            } else if (res.ok) {
                setSubmitted(true);
                resetForm();
                setTimeout(() => setSubmitted(false), 2000);
            } else {
                alert("Failed to submit. Please try again.");
            }
        } catch {
            alert("Network error. Check your connection.");
        } finally {
            setSubmitting(false);
        }
    }

    function renderField(config: FieldConfig) {
        if (config.kind === "segmented") {
            return (
                <div className="flex flex-wrap gap-2">
                    {config.options?.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setIntelType(option.value)}
                            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                                intelType === option.value
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            );
        }

        if (config.kind === "select") {
            const options =
                config.name === "candidateId"
                    ? candidates.map((candidate) => ({
                        value: candidate.id,
                        label: `${candidate.name} (${candidate.party})`,
                    }))
                    : config.options ?? [];

            return (
                <select
                    value={config.name === "ward" ? ward : candidateId}
                    onChange={(e) => {
                        if (config.name === "ward") setWard(e.target.value);
                        if (config.name === "candidateId") setCandidateId(e.target.value);
                    }}
                    required={config.required}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                >
                    <option value="">{config.placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (config.kind === "text") {
            return (
                <>
                    <input
                        type="text"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        maxLength={200}
                        placeholder={config.placeholder}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500">{summary.length}/200</p>
                </>
            );
        }

        return (
            <textarea
                value={config.name === "detailedNotes" ? detailedNotes : recommendation}
                onChange={(e) => {
                    if (config.name === "detailedNotes") setDetailedNotes(e.target.value);
                    if (config.name === "recommendation") setRecommendation(e.target.value);
                }}
                rows={config.name === "detailedNotes" ? 6 : 4}
                placeholder={config.placeholder}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
        );
    }

    return (
        <div className="space-y-4 px-1 pb-4 sm:space-y-5">
            {!isOnline && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    You are offline. Reports will be saved locally and synced when you reconnect.
                </div>
            )}

            {isOnline && pendingCount > 0 && (
                <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                    <p>{pendingCount} report{pendingCount > 1 ? "s" : ""} pending sync.</p>
                    <button
                        type="button"
                        onClick={manualSync}
                        disabled={syncing}
                        className="text-left font-medium text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                        {syncing ? "Syncing..." : "Sync now"}
                    </button>
                </div>
            )}

            {submitted && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <p className="text-sm font-medium text-emerald-900">Intelligence submitted.</p>
                    <p className="text-xs text-emerald-800">Your report is now available to the campaign team.</p>
                </div>
            )}

            {submittedOffline && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="text-sm font-medium text-amber-900">Saved offline.</p>
                    <p className="text-xs text-amber-800">
                        This report will sync automatically when the device reconnects.
                    </p>
                </div>
            )}

            <div className="space-y-1">
                <h1 className="text-xl font-semibold text-slate-900">Submit intelligence</h1>
                <p className="text-sm text-slate-500">
                    Minimal field reporting for the research team.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                {FIELD_CONFIGS.map((config) => (
                    <div key={config.name} className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            {config.label}
                            {config.required ? " *" : ""}
                        </label>
                        {renderField(config)}
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={submitting || !intelType || !ward}
                    className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {submitting ? "Submitting..." : isOnline ? "Submit intelligence" : "Save offline"}
                </button>
            </form>
        </div>
    );
}
