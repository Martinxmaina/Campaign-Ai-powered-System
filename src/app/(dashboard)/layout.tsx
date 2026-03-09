"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleProvider, useRoleContext } from "@/components/auth/RoleContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { canAccessPath, getHomeForRole } from "@/lib/roles";

function AccessGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { role } = useRoleContext();

    if (canAccessPath(role, pathname)) {
        return <>{children}</>;
    }

    return (
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8f9fb] p-6">
            <div className="max-w-2xl bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                    Access restricted
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    Your current role does not have permission to view this page.
                </p>
                <Link
                    href={getHomeForRole(role)}
                    className="inline-flex mt-4 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                    Go to my workspace
                </Link>
            </div>
        </main>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <RoleProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Header />
                    <AccessGate>
                        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8f9fb]">
                            {children}
                        </main>
                    </AccessGate>
                </div>
            </div>
        </RoleProvider>
    );
}
