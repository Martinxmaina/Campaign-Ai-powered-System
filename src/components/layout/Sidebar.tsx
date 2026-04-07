"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
    LayoutDashboard, Users, MessageSquare, CalendarDays, Shield,
    ListChecks, HeartPulse, Database, TrendingUp, BarChart3,
    Bot, Settings, Megaphone, Radio, PanelLeftClose, PanelLeftOpen,
    FlaskConical, DollarSign, Users2, Flag, UserCheck, Award, Clock, User, Brain, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { roleLabels, canAccessPath } from "@/lib/roles";
import { useRoleContext } from "@/components/auth/RoleContext";

const navSections = [
    {
        title: "Overview",
        roles: ["super-admin", "campaign-manager", "research", "comms", "finance", "call-center", "media"],
        items: [
            { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
            { label: "Analytics", icon: BarChart3, href: "/analytics" },
            { label: "Sentiment", icon: HeartPulse, href: "/sentiment" },
        ],
    },
    {
        title: "Outreach",
        roles: ["super-admin", "campaign-manager", "comms"],
        items: [
            { label: "Outreach Database", icon: Database, href: "/database" },
            { label: "Messaging", icon: MessageSquare, href: "/messaging" },
            { label: "Events", icon: CalendarDays, href: "/events" },
            { label: "Surveys", icon: ListChecks, href: "/surveys" },
        ],
    },
    {
        title: "Teams",
        roles: ["super-admin", "campaign-manager", "research", "comms", "finance", "call-center", "media"],
        items: [
            { label: "Research Team", icon: FlaskConical, href: "/research" },
            { label: "Finance Team", icon: DollarSign, href: "/finance" },
            { label: "Comms Team", icon: Users2, href: "/comms" },
            { label: "Outreach CRM", icon: Database, href: "/outreach" },
            { label: "Call Center", icon: Users, href: "/call-center" },
            { label: "Media & Content", icon: Radio, href: "/media" },
        ],
    },
    {
        title: "Intelligence",
        roles: ["super-admin", "campaign-manager", "research", "comms", "finance"],
        items: [
            { label: "Candidates", icon: UserCheck, href: "/candidates" },
            { label: "Candidate Intel", icon: Brain, href: "/candidate-intel" },
            { label: "Parties", icon: Award, href: "/parties" },
            { label: "Submit Intel", icon: Upload, href: "/research/intel-form" },
            { label: "Social Listening", icon: Radio, href: "/social" },
            { label: "War Room", icon: Shield, href: "/war-room" },
            { label: "Ad Performance", icon: TrendingUp, href: "/performance" },
            { label: "AI Assistant", icon: Bot, href: "/assistant" },
        ],
    },
    {
        title: "Opposition",
        roles: ["super-admin", "campaign-manager", "research", "comms"],
        items: [
            { label: "Opposition Tracker", icon: Flag, href: "/opposition" },
            { label: "Opposition Ads", icon: TrendingUp, href: "/opposition-ads" },
        ],
    },
    {
        title: "Admin",
        roles: ["super-admin", "campaign-manager", "finance"],
        items: [
            { label: "Users & Roles", icon: Users, href: "/admin/users" },
            { label: "Admin Overview", icon: LayoutDashboard, href: "/admin/overview" },
            { label: "Admin AI Assistant", icon: Bot, href: "/admin/assistant" },
            { label: "Audit Trail", icon: ListChecks, href: "/admin/audit-trail" },
            { label: "Countdown", icon: Clock, href: "/admin/countdown" },
            { label: "Settings", icon: Settings, href: "/settings" },
        ],
    },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen?: boolean;
    onCloseMobile?: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen = false, onCloseMobile }: SidebarProps) {
    const pathname = usePathname();
    const { role, user } = useRoleContext();
    const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
    const initials = displayName.slice(0, 2).toUpperCase();

    useEffect(() => {
        onCloseMobile?.();
    }, [onCloseMobile, pathname]);

    return (
        <aside
            className={cn(
                "bg-[#1e293b] fixed inset-y-0 left-0 z-40 flex h-screen flex-col overflow-hidden transition-transform duration-300 md:sticky md:top-0 md:z-auto md:translate-x-0 md:transition-all",
                mobileOpen ? "translate-x-0" : "-translate-x-full",
                collapsed ? "w-15 md:w-15" : "w-64 md:w-60"
            )}
        >
            {/* Logo + Toggle */}
            <div className={cn(
                "flex items-center border-b border-white/6 h-14 shrink-0",
                collapsed ? "justify-center px-3" : "px-5 gap-2.5"
            )}>
                {!collapsed && (
                    <>
                        <div className="bg-blue-500 p-1.5 rounded-lg text-white shrink-0">
                            <Megaphone className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-white text-[15px] tracking-tight flex-1">
                            VoterCore
                        </span>
                        <span className="text-[9px] font-medium text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                            PRO
                        </span>
                    </>
                )}
                {collapsed && (
                    <div className="bg-blue-500 p-1.5 rounded-lg text-white">
                        <Megaphone className="h-4 w-4" />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-5 px-2">
                {navSections
                    .filter(
                        (section) =>
                            (!section.roles || section.roles.includes(role)) &&
                            section.items.some((item) => canAccessPath(role, item.href))
                    )
                    .map((section) => (
                    <div key={section.title}>
                        {!collapsed && (
                            <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                {section.title}
                            </div>
                        )}
                        <div className="space-y-0.5">
                            {section.items
                                .filter((item) => canAccessPath(role, item.href))
                                .map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        title={collapsed ? item.label : undefined}
                                        className={cn(
                                            "flex items-center gap-2.5 rounded-md text-[13px] font-medium transition-all duration-150",
                                            collapsed ? "justify-center px-2 py-2.5" : "px-2.5 py-1.75",
                                            isActive
                                                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                                                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        {!collapsed && item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Footer */}
            <div className="border-t border-white/6 px-2 py-3 space-y-1">
                {/* My Account link */}
                <Link
                    href="/account"
                    title={collapsed ? "My Account" : undefined}
                    className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all text-[13px] font-medium",
                        collapsed && "justify-center",
                        pathname === "/account" && "bg-blue-600 text-white hover:bg-blue-600 hover:text-white"
                    )}
                >
                    <User className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>My Account</span>}
                </Link>

                {/* Collapse toggle */}
                <button
                    onClick={onToggle}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className={cn(
                        "hidden md:flex w-full items-center gap-2.5 px-2.5 py-2 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all text-[13px] font-medium",
                        collapsed && "justify-center"
                    )}
                >
                    {collapsed
                        ? <PanelLeftOpen className="h-4 w-4" />
                        : <><PanelLeftClose className="h-4 w-4" /><span>Collapse</span></>
                    }
                </button>

                {!collapsed && (
                    <Link href="/account" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-white/5 transition-colors group">
                        <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-white truncate">{displayName}</p>
                            <p className="text-[10px] text-slate-500 truncate">
                                {roleLabels[role]}
                            </p>
                        </div>
                    </Link>
                )}

                {collapsed && (
                    <Link href="/account" title="My Account" className="w-full flex items-center justify-center py-2 rounded-md hover:bg-white/5 transition-all">
                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[9px] font-bold">
                            {initials}
                        </div>
                    </Link>
                )}
            </div>
        </aside>
    );
}
