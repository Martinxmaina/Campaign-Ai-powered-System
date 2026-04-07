"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Plus, Search, Clock } from "lucide-react";
import { authFetch } from "@/utils/supabase/auth-fetch";

interface UserRow {
    id: string;
    email: string;
    full_name: string;
    role: string;
    role_label: string;
    created_at: string;
    last_sign_in: string | null;
}

function timeAgo(value: string | null) {
    if (!value) return "Never";
    const date = new Date(value);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        authFetch("/api/admin/users")
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to load users");
                setUsers(data.users ?? []);
            })
            .catch((err) => {
                setError(String(err));
                setUsers([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return users;
        return users.filter((user) =>
            [user.full_name, user.email, user.role_label].some((value) =>
                value.toLowerCase().includes(term),
            ),
        );
    }, [search, users]);

    const roles = useMemo(() => {
        const counts = new Map<string, number>();
        users.forEach((user) => {
            counts.set(user.role_label, (counts.get(user.role_label) ?? 0) + 1);
        });
        return Array.from(counts.entries());
    }, [users]);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg md:text-xl font-bold text-slate-900">Users & Permissions</h1><p className="text-sm text-slate-500 mt-0.5">Manage real team members and role-based access.</p></div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"><Plus className="h-4 w-4" /> Add User</button>
            </div>

            {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    Loading users from the database...
                </div>
            ) : error ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-8 text-center">
                    <h2 className="text-sm font-medium text-amber-900">Users unavailable</h2>
                    <p className="mt-1 text-xs text-amber-800">{error}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                        {roles.map(([role, count]) => (
                            <div key={role} className="stat-card bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                    <Users className="h-4 w-4" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{count}</h3>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{role}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="px-4 py-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <h2 className="text-sm font-semibold text-slate-900">Team Members</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Search users..." />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-slate-100 text-left text-slate-500">
                                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide sm:px-6">User</th>
                                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide sm:px-6">Role</th>
                                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide sm:px-6">Created</th>
                                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide sm:px-6">Last Active</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.map((user) => {
                                        const initials = (user.full_name || user.email).split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
                                        return (
                                            <tr key={user.id} className="table-row-hover">
                                                <td className="px-4 py-3 sm:px-6"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">{initials}</div><div><p className="font-medium text-slate-900">{user.full_name || "Unnamed user"}</p><p className="text-[10px] text-slate-400">{user.email}</p></div></div></td>
                                                <td className="px-4 py-3 sm:px-6"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{user.role_label}</span></td>
                                                <td className="px-4 py-3 text-xs text-slate-600 sm:px-6">{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-xs text-slate-500 sm:px-6"><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" />{timeAgo(user.last_sign_in)}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
