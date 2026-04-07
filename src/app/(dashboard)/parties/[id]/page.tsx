"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Plus, RefreshCw, Upload, Edit2, Check, X, Loader2, Trash2, Palette } from "lucide-react";
import { getPartyById, getPoliticalSeats, type PoliticalParty, type PoliticalSeat } from "@/lib/supabase/queries";
import { CONSTITUENCIES } from "@/lib/geography";
import { authFetch } from "@/utils/supabase/auth-fetch";

const SEAT_TYPES = [
    { id: "mp",               label: "MPs" },
    { id: "governor",         label: "Governors" },
    { id: "senator",          label: "Senators" },
    { id: "women_rep",        label: "Women Reps" },
    { id: "president",        label: "President" },
    { id: "deputy_president", label: "Deputy President" },
    { id: "mca",              label: "MCAs" },
] as const;

interface AddSeatForm {
    candidate_name: string;
    constituency: string;
    ward: string;
    vote_count: string;
    vote_share: string;
    status: string;
}

const EMPTY_FORM: AddSeatForm = { candidate_name: "", constituency: "", ward: "", vote_count: "", vote_share: "", status: "declared" };

export default function PartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [party, setParty] = useState<PoliticalParty | null>(null);
    const [seats, setSeats] = useState<PoliticalSeat[]>([]);
    const [activeTab, setActiveTab] = useState<string>("mp");
    const [loading, setLoading] = useState(true);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [editName, setEditName] = useState(false);
    const [nameDraft, setNameDraft] = useState("");
    const [editColor, setEditColor] = useState(false);
    const [colorDraft, setColorDraft] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState<AddSeatForm>(EMPTY_FORM);
    const [adding, setAdding] = useState(false);

    async function load() {
        const [p, s] = await Promise.all([
            getPartyById(id),
            getPoliticalSeats({ partyId: id, limit: 200 }),
        ]);
        setParty(p);
        if (p) { setNameDraft(p.name); setColorDraft(p.hex_color ?? "#64748b"); }
        setSeats(s);
        setLoading(false);
    }

    useEffect(() => { load(); }, [id]);

    async function uploadLogo(file: File) {
        setUploadingLogo(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            await authFetch(`/api/parties/${id}/logo`, { method: "POST", body: formData });
            await load();
        } catch (err) { console.error(err); }
        setUploadingLogo(false);
    }

    async function saveName() {
        setEditName(false);
        await authFetch(`/api/parties/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nameDraft }),
        });
        await load();
    }

    async function saveColor() {
        setEditColor(false);
        await authFetch(`/api/parties/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hex_color: colorDraft }),
        });
        await load();
    }

    async function handleDelete() {
        if (!confirm(`Permanently delete "${party?.name}"? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await authFetch(`/api/parties/${id}`, { method: "DELETE" });
            router.push("/parties");
        } catch (err) { console.error(err); }
        setDeleting(false);
    }

    async function handleAddSeat(e: React.FormEvent) {
        e.preventDefault();
        setAdding(true);
        try {
            await authFetch(`/api/parties/${id}/seats`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    seat_type: activeTab,
                    party_id: id,
                    vote_count: form.vote_count ? parseInt(form.vote_count) : 0,
                    vote_share: form.vote_share ? parseFloat(form.vote_share) : 0,
                    level: ["president", "deputy_president", "senator"].includes(activeTab) ? "national" :
                           activeTab === "governor" ? "county" :
                           activeTab === "mca" ? "ward" : "constituency",
                }),
            });
            setForm(EMPTY_FORM);
            setShowAdd(false);
            await load();
        } catch (err) { console.error(err); }
        setAdding(false);
    }

    const tabSeats = seats.filter((s) => s.seat_type === activeTab);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
    );

    if (!party) return (
        <div className="p-6 text-center text-slate-400">Party not found.</div>
    );

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl">
            <button onClick={() => router.push("/parties")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="h-4 w-4" /> All Parties
            </button>

            {/* Party header */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="h-1.5 w-full rounded-full mb-5" style={{ backgroundColor: party.hex_color ?? "#64748b" }} />
                <div className="flex items-start gap-4">
                    {/* Logo upload */}
                    <label className="relative w-20 h-20 rounded-2xl shrink-0 cursor-pointer group">
                        {party.logo_url ? (
                            <Image src={party.logo_url} alt={party.short_name} width={80} height={80} className="w-20 h-20 rounded-2xl object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-lg font-black" style={{ backgroundColor: party.hex_color ?? "#64748b" }}>
                                {party.short_name.slice(0, 3)}
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {uploadingLogo ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Upload className="h-5 w-5 text-white" />}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
                    </label>

                    <div className="flex-1">
                        {editName ? (
                            <div className="flex items-center gap-2">
                                <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}
                                    className="text-xl font-black text-slate-900 border-b border-blue-400 focus:outline-none bg-transparent" />
                                <button onClick={saveName} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check className="h-4 w-4" /></button>
                                <button onClick={() => setEditName(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X className="h-4 w-4" /></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-slate-900">{party.name}</h1>
                                <button onClick={() => setEditName(true)} className="text-slate-400 hover:text-blue-500 transition-colors">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: party.hex_color ?? "#64748b" }}>
                                {party.short_name}
                            </span>
                            {party.coalition && <span className="text-xs text-slate-500">Coalition: {party.coalition}</span>}
                            {party.founded_year && <span className="text-xs text-slate-400">Founded {party.founded_year}</span>}
                        </div>
                        {party.description && <p className="text-sm text-slate-600 mt-2">{party.description}</p>}

                        {/* Color picker */}
                        <div className="mt-3 flex items-center gap-2">
                            {editColor ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={colorDraft}
                                        onChange={(e) => setColorDraft(e.target.value)}
                                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                                    />
                                    <span className="text-xs text-slate-500 font-mono">{colorDraft}</span>
                                    <button onClick={saveColor} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check className="h-4 w-4" /></button>
                                    <button onClick={() => setEditColor(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X className="h-4 w-4" /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setEditColor(true)}
                                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-500 transition-colors"
                                >
                                    <Palette className="h-3.5 w-3.5" />
                                    Edit color
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-3xl font-black text-slate-900">{seats.length}</p>
                        <p className="text-xs text-slate-500">total candidates</p>
                    </div>
                </div>
            </div>

            {/* Seat tabs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="border-b border-slate-100 px-4 flex overflow-x-auto">
                    {SEAT_TYPES.map(({ id: seatId, label }) => {
                        const count = seats.filter((s) => s.seat_type === seatId).length;
                        return (
                            <button
                                key={seatId}
                                onClick={() => { setActiveTab(seatId); setShowAdd(false); }}
                                className={`shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                                    activeTab === seatId
                                        ? "border-blue-600 text-blue-700"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                {label}
                                {count > 0 && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{count}</span>}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-500">{tabSeats.length} {SEAT_TYPES.find(s => s.id === activeTab)?.label ?? activeTab}</p>
                        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                            <Plus className="h-3.5 w-3.5" /> Add candidate
                        </button>
                    </div>

                    {/* Add seat form */}
                    {showAdd && (
                        <form onSubmit={handleAddSeat} className="bg-slate-50 rounded-xl p-4 mb-4 grid grid-cols-2 gap-3">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-[10px] text-slate-500 block mb-1">Candidate name *</label>
                                <input value={form.candidate_name} onChange={(e) => setForm(f => ({ ...f, candidate_name: e.target.value }))}
                                    required placeholder="Full name"
                                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" />
                            </div>
                            {["mp", "mca"].includes(activeTab) && (
                                <div>
                                    <label className="text-[10px] text-slate-500 block mb-1">Constituency</label>
                                    <select value={form.constituency} onChange={(e) => setForm(f => ({ ...f, constituency: e.target.value }))}
                                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none">
                                        <option value="">Select…</option>
                                        {CONSTITUENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="text-[10px] text-slate-500 block mb-1">Vote count</label>
                                <input type="number" value={form.vote_count} onChange={(e) => setForm(f => ({ ...f, vote_count: e.target.value }))}
                                    placeholder="0"
                                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 block mb-1">Vote share (%)</label>
                                <input type="number" step="0.01" value={form.vote_share} onChange={(e) => setForm(f => ({ ...f, vote_share: e.target.value }))}
                                    placeholder="0.00"
                                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none" />
                            </div>
                            <div className="col-span-2 flex gap-2">
                                <button type="submit" disabled={adding}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {adding ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    {adding ? "Adding…" : "Add"}
                                </button>
                                <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                            </div>
                        </form>
                    )}

                    {tabSeats.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400">
                            No {SEAT_TYPES.find(s => s.id === activeTab)?.label ?? activeTab} yet. Click Add candidate above.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left text-slate-500">
                                        <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Candidate</th>
                                        {["mp", "mca"].includes(activeTab) && <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Constituency</th>}
                                        <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Votes</th>
                                        <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Share</th>
                                        <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {tabSeats.map((seat) => (
                                        <tr key={seat.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{seat.candidate_name ?? "—"}</td>
                                            {["mp", "mca"].includes(activeTab) && <td className="px-4 py-3 text-xs text-slate-500">{seat.constituency ?? "—"}</td>}
                                            <td className="px-4 py-3 text-xs text-slate-600">{(seat.vote_count ?? 0).toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${seat.vote_share ?? 0}%`, backgroundColor: party.hex_color ?? "#64748b" }} />
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-900">{seat.vote_share ?? 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                                    seat.status === "elected" || seat.status === "declared" ? "bg-emerald-50 text-emerald-700" :
                                                    seat.status === "pending" ? "bg-amber-50 text-amber-700" :
                                                    "bg-slate-100 text-slate-600"
                                                }`}>{seat.status ?? "—"}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {/* Danger zone */}
            <div className="bg-white rounded-xl border border-red-100 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Danger zone</h3>
                <p className="text-xs text-slate-500 mb-4">
                    Permanently delete <strong>{party.name}</strong>. This removes the party and all associated data and cannot be undone.
                </p>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    {deleting ? "Deleting…" : `Delete ${party.short_name}`}
                </button>
            </div>
        </div>
    );
}
