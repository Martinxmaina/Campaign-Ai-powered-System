"use client";

import { useRef, useState, useEffect } from "react";
import { Search, Bell, ChevronDown, Calendar, FileText, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, Menu } from "lucide-react";
import { useRoleContext } from "@/components/auth/RoleContext";
import { roleLabels } from "@/lib/roles";
import { useNotifications } from "@/lib/supabase/realtime";
import Link from "next/link";
import ElectionCountdown from "@/components/layout/ElectionCountdown";

function NotificationIcon({ type }: { type: string | null }) {
    if (type === "critical" || type === "warning") return <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />;
    if (type === "success") return <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />;
    if (type === "error") return <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />;
    return <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />;
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function Header({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
    const { role, user, signOut } = useRoleContext();
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications(user?.id);
    const [bellOpen, setBellOpen] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);

    const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
    const initials = displayName.slice(0, 2).toUpperCase();

    // Close bell dropdown on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setBellOpen(false);
            }
        }
        if (bellOpen) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [bellOpen]);

    return (
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-6 shrink-0 min-w-0 gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <button
                    type="button"
                    onClick={onOpenMobileNav}
                    className="inline-flex md:hidden items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600"
                    aria-label="Open navigation"
                >
                    <Menu className="h-4 w-4" />
                </button>
                {/* Search */}
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        className="w-40 md:w-72 pl-9 pr-4 py-1.75 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Search anything..."
                        type="text"
                    />
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-medium">
                        {roleLabels[role]}
                    </span>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 min-w-0">
                {/* Election Countdown (compact) */}
                <div className="hidden lg:block">
                    <ElectionCountdown mode="compact" />
                </div>

                {/* Campaign Selector */}
                <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mr-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Ol Kalou 2026</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <div className="hidden md:block h-5 w-px bg-slate-200 mx-1" />

                {/* Notifications Bell */}
                <div className="relative" ref={bellRef}>
                    <button
                        onClick={() => setBellOpen((o) => !o)}
                        className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <Bell className="h-4.5 w-4.5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full ring-2 ring-white flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {bellOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                                    >
                                        <CheckCheck className="h-3 w-3" />
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-xs text-slate-400">
                                        No notifications yet.
                                    </div>
                                ) : (
                                    notifications.slice(0, 10).map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => markRead(n.id)}
                                            className={`px-4 py-3 flex gap-2.5 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}
                                        >
                                            <NotificationIcon type={n.type} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-medium text-slate-800 line-clamp-1 ${!n.read ? "font-semibold" : ""}`}>
                                                    {n.title}
                                                </p>
                                                {n.body && (
                                                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                                                )}
                                                <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                                            </div>
                                            {!n.read && (
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {notifications.length > 10 && (
                                <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                                    <Link
                                        href="/admin/audit-trail"
                                        onClick={() => setBellOpen(false)}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        View all activity →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Generate Reports button */}
                <button
                    onClick={() => setShowReportModal(true)}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                    <FileText className="h-3.5 w-3.5" />
                    Generate Reports
                </button>

                {/* User info */}
                <div className="flex items-center gap-2 ml-1">
                    <Link href="/account" className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[11px] font-bold hover:shadow-md transition-shadow" title="My Account">
                        {initials}
                    </Link>
                    <div className="hidden md:flex flex-col">
                        <span className="text-xs font-medium text-slate-700 leading-tight">{displayName}</span>
                        <span className="text-[10px] text-slate-400 leading-tight">{user?.email}</span>
                    </div>
                </div>
            </div>

            {/* Generate Reports — Coming Soon modal */}
            {showReportModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={() => setShowReportModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Generate Reports</h3>
                        <p className="text-sm text-slate-500 mb-5">
                            This feature is coming soon. Campaign reporting and exports will be available in the next release.
                        </p>
                        <button
                            onClick={() => setShowReportModal(false)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
