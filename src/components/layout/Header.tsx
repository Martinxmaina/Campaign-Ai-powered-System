"use client";

import { Search, Bell, ChevronDown, Calendar } from "lucide-react";
import { useRoleContext } from "@/components/auth/RoleContext";
import { CurrentUserRole, roleLabels } from "@/lib/roles";

const roleOptions: CurrentUserRole[] = [
    "super-admin",
    "campaign-manager",
    "research",
    "comms",
    "finance",
    "call-center",
    "media",
];

export default function Header() {
    const { role, setRole } = useRoleContext();

    return (
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        className="w-72 pl-9 pr-4 py-[7px] bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Search anything..."
                        type="text"
                    />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Logged in as</span>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as CurrentUserRole)}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-medium"
                    >
                        {roleOptions.map((option) => (
                            <option key={option} value={option}>
                                {roleLabels[option]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1">
                {/* Campaign Selector */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mr-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>2027 General Election</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <div className="h-5 w-px bg-slate-200 mx-1" />

                {/* Notifications */}
                <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                    <Bell className="h-[18px] w-[18px]" />
                    <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-red-500 rounded-full ring-2 ring-white" />
                </button>

                {/* Avatar */}
                <button className="ml-1 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[11px] font-bold hover:shadow-md transition-shadow">
                    {roleLabels[role].slice(0, 2).toUpperCase()}
                </button>
            </div>
        </header>
    );
}
