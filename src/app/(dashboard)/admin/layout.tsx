import Link from "next/link";
import { ReactNode } from "react";

const adminNav = [
    { label: "Org CRM Overview", href: "/admin/overview" },
    { label: "Users & Roles", href: "/admin/users" },
    { label: "Audit Trail", href: "/admin/audit-trail" },
    { label: "System & Logs", href: "/admin/system" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Admin workspace</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Org-wide CRM controls, users, and high-level reporting.
                    </p>
                </div>
                <nav className="flex gap-2 text-xs">
                    {adminNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
            {children}
        </div>
    );
}

