"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, Mail, Shield, Key, LogOut, Check, AlertTriangle, ChevronRight } from "lucide-react";
import { useRoleContext } from "@/components/auth/RoleContext";
import { roleLabels, canAccessPath, type CurrentUserRole } from "@/lib/roles";

const ROLE_PATHS: Record<CurrentUserRole, string[]> = {
    "super-admin": ["All pages (full access)"],
    "campaign-manager": ["/dashboard", "/analytics", "/research", "/war-room", "/candidates", "/parties", "/admin/countdown"],
    research: ["/dashboard", "/sentiment", "/research", "/social", "/candidates", "/parties"],
    comms: ["/dashboard", "/analytics", "/messaging", "/events", "/surveys", "/comms"],
    finance: ["/dashboard", "/finance", "/admin/overview", "/admin/audit-trail"],
    "call-center": ["/dashboard", "/call-center"],
    media: ["/dashboard", "/media"],
};

export default function AccountPage() {
    const { role, user, signOut } = useRoleContext();

    const [displayName, setDisplayName] = useState("");
    const [editName, setEditName] = useState("");
    const [editingName, setEditingName] = useState(false);
    const [savingName, setSavingName] = useState(false);
    const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);

    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [changingPw, setChangingPw] = useState(false);
    const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

    useEffect(() => {
        const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
        setDisplayName(name);
        setEditName(name);
    }, [user]);

    const initials = displayName.slice(0, 2).toUpperCase();

    const roleColor: Record<CurrentUserRole, string> = {
        "super-admin": "from-purple-500 to-purple-700",
        "campaign-manager": "from-blue-500 to-blue-700",
        research: "from-emerald-500 to-emerald-700",
        comms: "from-orange-500 to-orange-700",
        finance: "from-yellow-500 to-yellow-700",
        "call-center": "from-sky-500 to-sky-700",
        media: "from-pink-500 to-pink-700",
    };

    async function saveName() {
        if (!editName.trim() || editName === displayName) {
            setEditingName(false);
            return;
        }
        setSavingName(true);
        setNameMsg(null);
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/account", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
                },
                body: JSON.stringify({ full_name: editName.trim() }),
            });
            if (!res.ok) {
                const d = await res.json();
                setNameMsg({ ok: false, text: d.error ?? "Failed to save" });
            } else {
                setDisplayName(editName.trim());
                setNameMsg({ ok: true, text: "Name updated!" });
                setEditingName(false);
                setTimeout(() => setNameMsg(null), 3000);
            }
        } catch (e) {
            setNameMsg({ ok: false, text: String(e) });
        }
        setSavingName(false);
    }

    async function changePassword(e: React.FormEvent) {
        e.preventDefault();
        if (newPw !== confirmPw) {
            setPwMsg({ ok: false, text: "Passwords do not match" });
            return;
        }
        if (newPw.length < 8) {
            setPwMsg({ ok: false, text: "Password must be at least 8 characters" });
            return;
        }
        setChangingPw(true);
        setPwMsg(null);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: newPw });
            if (error) {
                setPwMsg({ ok: false, text: error.message });
            } else {
                setPwMsg({ ok: true, text: "Password changed successfully" });
                setCurrentPw(""); setNewPw(""); setConfirmPw("");
                setTimeout(() => setPwMsg(null), 4000);
            }
        } catch (e) {
            setPwMsg({ ok: false, text: String(e) });
        }
        setChangingPw(false);
    }

    async function signOutAll() {
        const supabase = createClient();
        await supabase.auth.signOut({ scope: "global" });
        window.location.href = "/login";
    }

    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
        : "—";
    const lastSignIn = user?.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : "—";

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 md:space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
                <div className="p-1.5 bg-blue-50 rounded-lg"><User className="h-4 w-4 text-blue-600" /></div>
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-900">My Account</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your profile, password, and session.</p>
                </div>
            </div>

            {/* Profile card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${roleColor[role]} flex items-center justify-center text-white text-xl font-black shrink-0`}>
                        {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Name */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {editingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setEditingName(false); setEditName(displayName); } }}
                                        className="px-2 py-1 text-sm border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        autoFocus
                                    />
                                    <button onClick={saveName} disabled={savingName}
                                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        {savingName ? "Saving…" : "Save"}
                                    </button>
                                    <button onClick={() => { setEditingName(false); setEditName(displayName); }}
                                        className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700">
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-slate-900">{displayName}</span>
                                    <button onClick={() => setEditingName(true)}
                                        className="text-xs text-blue-600 hover:underline">
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                        {nameMsg && (
                            <p className={`text-xs mt-1 ${nameMsg.ok ? "text-emerald-600" : "text-red-500"}`}>
                                {nameMsg.ok ? <Check className="inline h-3 w-3 mr-1" /> : <AlertTriangle className="inline h-3 w-3 mr-1" />}
                                {nameMsg.text}
                            </p>
                        )}

                        {/* Email */}
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{user?.email}</span>
                        </div>

                        {/* Role */}
                        <div className="mt-2">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full text-white bg-linear-to-r ${roleColor[role]}`}>
                                <Shield className="h-3 w-3" />
                                {roleLabels[role]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Account stats */}
                <div className="mt-5 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Joined</p>
                        <p className="text-sm font-medium text-slate-700 mt-0.5">{joinedDate}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Last sign-in</p>
                        <p className="text-sm font-medium text-slate-700 mt-0.5">{lastSignIn}</p>
                    </div>
                </div>
            </div>

            {/* Role permissions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-slate-400" />
                    Role Permissions
                </h2>
                <p className="text-xs text-slate-500 mb-3">Your role grants access to the following pages:</p>
                <div className="space-y-1.5">
                    {ROLE_PATHS[role].map((path) => (
                        <div key={path} className="flex items-center gap-2 text-xs text-slate-600">
                            <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
                            <span className="font-mono">{path}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Change password */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <Key className="h-4 w-4 text-slate-400" />
                    Change Password
                </h2>
                <form onSubmit={changePassword} className="space-y-3">
                    <div>
                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide block mb-1">New password</label>
                        <input
                            type="password"
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            placeholder="Min. 8 characters"
                            required
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide block mb-1">Confirm new password</label>
                        <input
                            type="password"
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                            placeholder="Repeat password"
                            required
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    {pwMsg && (
                        <p className={`text-xs flex items-center gap-1 ${pwMsg.ok ? "text-emerald-600" : "text-red-500"}`}>
                            {pwMsg.ok ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                            {pwMsg.text}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={changingPw || !newPw || !confirmPw}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {changingPw ? "Changing…" : "Change Password"}
                    </button>
                </form>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    Danger Zone
                </h2>
                <p className="text-xs text-slate-500 mb-4">This will sign you out on all devices immediately.</p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={signOutAll}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out of all sessions
                    </button>
                    <button
                        onClick={signOut}
                        className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                    >
                        Sign out this session only
                    </button>
                </div>
            </div>
        </div>
    );
}
