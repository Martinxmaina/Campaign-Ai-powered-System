"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Mail, Clock, Plus, Search, Loader2 } from "lucide-react";
import { getMessagingStats } from "@/lib/supabase/queries";
import type { MessageSent } from "@/lib/supabase/queries";

export default function MessagingPage() {
    const [messages, setMessages] = useState<MessageSent[]>([]);
    const [totalSent, setTotalSent] = useState(0);
    const [totalDelivered, setTotalDelivered] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getMessagingStats()
            .then(({ messages: msgs, totalSent: ts, totalDelivered: td }) => {
                setMessages(msgs);
                setTotalSent(ts);
                setTotalDelivered(td);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

    const stats = [
        { label: "Messages Sent", value: totalSent.toLocaleString(), icon: Send, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Delivered", value: totalDelivered.toLocaleString(), icon: MessageSquare, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
        { label: "Delivery Rate", value: `${deliveryRate}%`, icon: Mail, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
        { label: "Campaigns", value: String(messages.length), icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    ];

    const filtered = messages.filter((m) =>
        !search || m.channel?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-900">Messaging Campaigns</h1>
                    <p className="text-sm text-slate-500 mt-0.5">SMS, email, and WhatsApp campaigns — Ol Kalou</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="h-4 w-4" /> New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="stat-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{stat.label}</span>
                                <div className={`p-2 ${stat.iconBg} ${stat.iconColor} rounded-lg`}><Icon className="h-4 w-4" /></div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{loading ? "—" : stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Campaign List</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Filter by channel..."
                        />
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-12 text-sm text-slate-400">
                        No campaigns yet. Messages sent via /api/generate-messages will appear here.
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-slate-500">
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Channel</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Campaign ID</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Sent</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Delivered</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Open Rate</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((m) => (
                                    <tr key={m.id} className="table-row-hover cursor-pointer">
                                        <td className="px-6 py-3">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                m.channel === "email" ? "bg-violet-50 text-violet-600" :
                                                m.channel === "sms" ? "bg-blue-50 text-blue-600" :
                                                "bg-emerald-50 text-emerald-600"
                                            }`}>
                                                {m.channel ?? "unknown"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-700 text-xs truncate max-w-50">{m.campaign_id ?? "—"}</td>
                                        <td className="px-6 py-3 text-slate-600">{m.sent_count?.toLocaleString() ?? "—"}</td>
                                        <td className="px-6 py-3 text-slate-600">{m.delivered_count?.toLocaleString() ?? "—"}</td>
                                        <td className="px-6 py-3 font-semibold text-blue-600">
                                            {m.open_rate != null ? `${Math.round(m.open_rate * 100)}%` : "—"}
                                        </td>
                                        <td className="px-6 py-3 text-slate-400 text-xs">
                                            {m.sent_at ? new Date(m.sent_at).toLocaleDateString() : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
