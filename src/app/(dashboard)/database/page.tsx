"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Download, Plus, ChevronRight } from "lucide-react";
import { getVoterContacts, type VoterContact } from "@/lib/supabase/queries";

function timeAgo(value: string | null) {
    if (!value) return "Never";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
}

export default function DatabasePage() {
    const [contacts, setContacts] = useState<VoterContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getVoterContacts(100)
            .then((data) => setContacts(data))
            .catch(() => setContacts([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return contacts;
        return contacts.filter((contact) =>
            [contact.name, contact.phone, contact.ward, contact.support_level]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term)),
        );
    }, [contacts, search]);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-900">Outreach Database</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Real voter contacts, support levels, issues, and last-touch timestamps from the database.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-700"><Download className="h-4 w-4" /> Export</button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"><Plus className="h-4 w-4" /> Add Voter</button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none shadow-sm"
                    placeholder="Search by name, phone, ward, or support level..."
                />
            </div>

            {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    Loading contacts from the database...
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                    <h2 className="text-sm font-medium text-slate-900">No contacts found</h2>
                    <p className="mt-1 text-xs text-slate-500">Add records to `voter_contacts` to populate this page.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-slate-500 bg-slate-50/50">
                                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide sm:px-6">Contact</th>
                                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide sm:px-6">Phone</th>
                                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide sm:px-6">Ward</th>
                                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide sm:px-6">Support</th>
                                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide sm:px-6">Issues</th>
                                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide sm:px-6">Last Contact</th>
                                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide sm:px-6" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((contact) => {
                                    const initials = (contact.name ?? "NA").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
                                    return (
                                        <tr key={contact.id} className="table-row-hover cursor-pointer group">
                                            <td className="px-4 py-3 sm:px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{contact.name ?? "Unnamed contact"}</p>
                                                        <p className="text-[10px] text-slate-400">{contact.source ?? "Source not set"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 sm:px-6">{contact.phone ?? "—"}</td>
                                            <td className="px-4 py-3 text-xs text-slate-600 sm:px-6">{contact.ward ?? "—"}</td>
                                            <td className="px-4 py-3 sm:px-6">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                    {contact.support_level ?? "Unknown"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 sm:px-6">
                                                {(contact.issues ?? []).length > 0 ? (contact.issues ?? []).join(", ") : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500 sm:px-6">{timeAgo(contact.last_contact)}</td>
                                            <td className="px-4 py-3 sm:px-6"><ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" /></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
