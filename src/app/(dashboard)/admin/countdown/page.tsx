"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, Trash2, Star, RefreshCw, Check } from "lucide-react";
import { getElectionEvents, type ElectionEvent } from "@/lib/supabase/queries";
import ElectionCountdown from "@/components/layout/ElectionCountdown";
import { authFetch } from "@/utils/supabase/auth-fetch";

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminCountdownPage() {
    const [events, setEvents] = useState<ElectionEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ event_name: "", event_date: "", description: "", type: "election", is_primary: false });
    const [adding, setAdding] = useState(false);

    async function load() {
        try {
            const data = await getElectionEvents();
            setEvents(data);
        } catch { setEvents([]); }
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!form.event_name || !form.event_date) return;
        setAdding(true);
        try {
            const res = await authFetch("/api/admin/countdown", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setForm({ event_name: "", event_date: "", description: "", type: "election", is_primary: false });
                setShowAdd(false);
                await load();
            }
        } catch (err) { console.error(err); }
        setAdding(false);
    }

    async function setPrimary(id: string) {
        await authFetch("/api/admin/countdown", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, is_primary: true }),
        });
        await load();
    }

    async function deleteEvent(id: string) {
        if (!confirm("Delete this event?")) return;
        await authFetch("/api/admin/countdown", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        await load();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">Election Countdown</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Manage election events shown in the countdown widget.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAdd((v) => !v)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Add Event
                </button>
            </div>

            {/* Live preview */}
            <ElectionCountdown mode="full" />

            {/* Add form */}
            {showAdd && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-blue-900 mb-3">Add election event</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                            <label className="text-[10px] font-medium text-blue-700 block mb-1">Event name *</label>
                            <input value={form.event_name} onChange={(e) => setForm(f => ({ ...f, event_name: e.target.value }))}
                                placeholder="2027 General Election" required
                                className="w-full px-3 py-2 text-xs border border-blue-200 rounded-lg bg-white focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="text-[10px] font-medium text-blue-700 block mb-1">Date &amp; time *</label>
                            <input type="datetime-local" value={form.event_date} onChange={(e) => setForm(f => ({ ...f, event_date: e.target.value }))}
                                required className="w-full px-3 py-2 text-xs border border-blue-200 rounded-lg bg-white focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="text-[10px] font-medium text-blue-700 block mb-1">Type</label>
                            <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                                className="w-full px-3 py-2 text-xs border border-blue-200 rounded-lg bg-white focus:outline-none">
                                <option value="election">Election</option>
                                <option value="primary">Primary</option>
                                <option value="deadline">Deadline</option>
                                <option value="rally">Rally</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[10px] font-medium text-blue-700 block mb-1">Description</label>
                            <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Optional description"
                                className="w-full px-3 py-2 text-xs border border-blue-200 rounded-lg bg-white focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-3">
                            <label className="flex items-center gap-2 text-xs text-blue-700 cursor-pointer">
                                <input type="checkbox" checked={form.is_primary} onChange={(e) => setForm(f => ({ ...f, is_primary: e.target.checked }))}
                                    className="rounded" />
                                Set as primary countdown (shown system-wide)
                            </label>
                        </div>
                        <div className="sm:col-span-2 flex gap-2">
                            <button type="submit" disabled={adding}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {adding ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                {adding ? "Adding…" : "Add Event"}
                            </button>
                            <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-blue-600 hover:underline">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Events table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading events…</span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="py-16 text-center">
                        <Clock className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No election events yet</p>
                        <p className="text-xs text-slate-400 mt-1">Add the 2027 election date to show a live countdown.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Event</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Date</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Type</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Primary</th>
                                <th className="px-6 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {events.map((ev) => (
                                <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3">
                                        <p className="text-sm font-medium text-slate-900">{ev.event_name}</p>
                                        {ev.description && <p className="text-[10px] text-slate-400">{ev.description}</p>}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{formatDate(ev.event_date)}</td>
                                    <td className="px-6 py-3 text-xs text-slate-500 capitalize">{ev.type}</td>
                                    <td className="px-6 py-3">
                                        {ev.is_primary ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                                                <Star className="h-3 w-3 fill-blue-500" /> Primary
                                            </span>
                                        ) : (
                                            <button onClick={() => setPrimary(ev.id)} className="text-[10px] text-slate-400 hover:text-blue-500 hover:underline">
                                                Set primary
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button onClick={() => deleteEvent(ev.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
