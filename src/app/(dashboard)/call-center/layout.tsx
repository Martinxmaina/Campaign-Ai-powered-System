import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
    { label: "Dashboard", href: "/call-center" },
    { label: "Logs", href: "/call-center/logs" },
    { label: "Reports", href: "/call-center/reports" },
    { label: "AI Assistant", href: "/call-center/assistant" },
];

export default function CallCenterLayout({ children }: { children: ReactNode }) {
    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">
                        Call Center workspace
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Call handling, constituent feedback, and survey data intake.
                    </p>
                </div>
                <nav className="flex gap-2 text-xs">
                    {navItems.map((item) => (
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

