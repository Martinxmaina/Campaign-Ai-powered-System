"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, UserPlus, RefreshCw, Shield, Trash2, ChevronDown, Check, Search, Circle } from "lucide-react";
import { roleLabels, type CurrentUserRole } from "@/lib/roles";
import { useRoleContext } from "@/components/auth/RoleContext";
import { usePresence } from "@/lib/supabase/realtime";
import { createClient } from "@/utils/supabase/client";

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: CurrentUserRole;
    role_label: string;
    created_at: string;
    last_sign_in: string | null;
}

const ROLE_OPTIONS = Object.entries(roleLabels) as [CurrentUserRole, string][];

const ROLE_COLORS: Partial<Record<CurrentUserRole, string>> = {
    "super-admin":      "bg-red-50 text-red-700 border-red-200",
    "campaign-manager": "bg-blue-50 text-blue-700 border-blue-200",
    research:           "bg-violet-50 text-violet-700 border-violet-200",
    comms:              "bg-emerald-50 text-emerald-700 border-emerald-200",
    finance:            "bg-amber-50 text-amber-700 border-amber-200",
    "call-center":      "bg-pink-50 text-pink-700 border-pink-200",
    media:              "bg-indigo-50 text-indigo-700 border-indigo-200",
};

function formatDate(iso: string | null) {
    if (!iso) return "Never";
    return new Date(iso).toLocaleDateString("en-KE", { dateStyle: "medium" });
}

async function getAuthHeader(): Promise<Record<string, string>> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export default function AdminUsersPage() {
    const { role, user } = useRoleContext();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");
    const [inviteRole, setInviteRole] = useState<CurrentUserRole>("campaign-manager");
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<CurrentUserRole | "">("");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // Online presence
    const presenceCurrentUser = useMemo(() => user ? {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
        role,
    } : null, [user, role]);
    const onlineUsers = usePresence(presenceCurrentUser);
    const onlineCount = Object.keys(onlineUsers).length;

    async function loadUsers() {
        setLoading(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch("/api/admin/users", { headers });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setUsers(data.users ?? []);
        } catch {
            setUsers([]);
        }
        setLoading(false);
    }

    useEffect(() => { loadUsers(); }, []);

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        setInviting(true);
        setError(null);
        try {
            const headers = { ...(await getAuthHeader()), "Content-Type": "application/json" };
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers,
                body: JSON.stringify({ email: inviteEmail, full_name: inviteName, role: inviteRole }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setShowInvite(false);
            setInviteEmail(""); setInviteName("");
            await loadUsers();
        } catch (err) {
            setError(String(err));
        }
        setInviting(false);
    }

    async function handleRoleChange(userId: string, newRole: CurrentUserRole) {
        setOpenDropdown(null);
        setActionError(null);
        const headers = { ...(await getAuthHeader()), "Content-Type": "application/json" };
        const res = await fetch("/api/admin/users", {
            method: "PATCH",
            headers,
            body: JSON.stringify({ userId, role: newRole }),
        });
        if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            setActionError(d.error ?? `Failed to update role (${res.status})`);
            return;
        }
        setUsers((prev) => prev.map((u) =>
            u.id === userId ? { ...u, role: newRole, role_label: roleLabels[newRole] } : u
        ));
    }

    async function handleDelete(userId: string) {
        if (!confirm("Remove this user? They will lose all access and cannot be recovered.")) return;
        setActionError(null);
        const headers = { ...(await getAuthHeader()), "Content-Type": "application/json" };
        const res = await fetch("/api/admin/users", {
            method: "DELETE",
            headers,
            body: JSON.stringify({ userId }),
        });
        if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            setActionError(d.error ?? `Failed to delete user (${res.status})`);
            return;
        }
        setUsers((prev) => prev.filter((u) => u.id !== userId));
    }

    const filtered = useMemo(() => {
        let list = users;
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((u) =>
                u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
            );
        }
        if (roleFilter) {
            list = list.filter((u) => u.role === roleFilter);
        }
        return list;
    }, [users, search, roleFilter]);

    if (role !== "super-admin") {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Shield className="h-10 w-10 text-slate-200" />
                <p className="text-sm font-semibold text-slate-500">Access denied</p>
                <p className="text-xs text-slate-400">Only super-admins can manage users and roles.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Action error banner */}
            {actionError && (
                <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">
                    <span>{actionError}</span>
                    <button onClick={() => setActionError(null)} className="ml-4 text-red-500 hover:text-red-700 font-bold">✕</button>
                </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold text-slate-900">Users &amp; Roles</h2>
                            {onlineCount > 0 && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {onlineCount} online
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Manage team members and access levels.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or email…"
                            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 w-48 bg-white"
                        />
                    </div>

                    {/* Role filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as CurrentUserRole | "")}
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
                    >
                        <option value="">All roles</option>
                        {ROLE_OPTIONS.map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    <button onClick={loadUsers} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                        <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
                    </button>

                    <button
                        onClick={() => setShowInvite(!showInvite)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                        <UserPlus className="h-3.5 w-3.5" />
                        Invite User
                    </button>
                </div>
            </div>

            {/* Invite form */}
            {showInvite && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-blue-900 mb-3 flex items-center gap-1.5">
                        <UserPlus className="h-3.5 w-3.5" /> Invite a new team member
                    </h3>
                    <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="text-[10px] font-medium text-blue-700 block mb-1">Full name</label>
                            <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                                placeholder="Jane Mwangi"
                                className="px-3 py-2 text-xs border border-blue-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 w-40" />
                        </div>
                        <div>
                            <label className="text-[10px] font-medium text-blue-700 block mb-1">Email *</label>
                            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="jane@campaign.org" required
                                className="px-3 py-2 text-xs border border-blue-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 w-48" />
                        </div>
                        <div>
                            <label className="text-[10px] font-medium text-blue-700 block mb-1">Role *</label>
                            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as CurrentUserRole)}
                                className="px-3 py-2 text-xs border border-blue-200 rounded-lg bg-white focus:outline-none">
                                {ROLE_OPTIONS.map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" disabled={inviting}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {inviting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            {inviting ? "Sending…" : "Send invite"}
                        </button>
                        <button type="button" onClick={() => setShowInvite(false)} className="text-xs text-blue-600 hover:underline">Cancel</button>
                    </form>
                    {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                </div>
            )}

            {/* Users table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading users…</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Shield className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">{search || roleFilter ? "No users match your filter." : "No users found"}</p>
                        {!search && !roleFilter && (
                            <p className="text-xs text-slate-400 mt-1">Invite team members using the button above.</p>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-slate-500">
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide w-8" />
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Name</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Email</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Role</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Joined</th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Last login</th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((u) => {
                                    const isOnline = !!onlineUsers[u.id];
                                    const isMe = u.id === user?.id;
                                    return (
                                        <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${isMe ? "bg-blue-50/30" : ""}`}>
                                            {/* Online dot */}
                                            <td className="pl-6 py-3">
                                                <div title={isOnline ? "Online now" : "Offline"}>
                                                    <Circle className={`h-2.5 w-2.5 ${isOnline ? "fill-emerald-500 text-emerald-500" : "fill-slate-200 text-slate-200"}`} />
                                                </div>
                                            </td>

                                            {/* Name */}
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                                        {(u.full_name || u.email).slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-slate-900">{u.full_name || "—"}</span>
                                                        {isMe && <span className="ml-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">You</span>}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-6 py-3 text-xs text-slate-600">{u.email}</td>

                                            {/* Role dropdown */}
                                            <td className="px-6 py-3">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenDropdown(openDropdown === u.id ? null : u.id)}
                                                        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${ROLE_COLORS[u.role] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                                                    >
                                                        {u.role_label}
                                                        <ChevronDown className="h-3 w-3" />
                                                    </button>
                                                    {openDropdown === u.id && (
                                                        <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20">
                                                            <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Change role</div>
                                                            {ROLE_OPTIONS.map(([key, label]) => (
                                                                <button
                                                                    key={key}
                                                                    onClick={() => handleRoleChange(u.id, key)}
                                                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 last:rounded-b-xl flex items-center justify-between ${u.role === key ? "font-semibold text-blue-600" : "text-slate-700"}`}
                                                                >
                                                                    {label}
                                                                    {u.role === key && <Check className="h-3 w-3" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-3 text-xs text-slate-500">{formatDate(u.created_at)}</td>
                                            <td className="px-6 py-3 text-xs text-slate-500">{formatDate(u.last_sign_in)}</td>

                                            {/* Delete */}
                                            <td className="px-6 py-3 text-right">
                                                {!isMe && (
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                                        title="Remove user"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="text-[10px] text-slate-400">
                {filtered.length} of {users.length} users
                {onlineCount > 0 && ` · ${onlineCount} online now`}
                {" · click role badge to change"}
            </p>

            {/* Close dropdown on outside click */}
            {openDropdown && (
                <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
            )}
        </div>
    );
}
