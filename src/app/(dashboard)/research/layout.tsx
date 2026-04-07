import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
    { label: "Overview", href: "/research" },
    { label: "Reports", href: "/research/reports" },
    { label: "Studies", href: "/research/studies" },
    { label: "Social Listening", href: "/research/social" },
    { label: "AI Assistant", href: "/research/assistant" },
];

export default function ResearchLayout({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto max-w-7xl space-y-4 p-4 md:space-y-6 md:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 md:text-xl">Research workspace</h1>
                    <p className="mt-0.5 text-xs text-slate-500 md:text-sm">
                        Polling, surveys, and issue tracking for the research team.
                    </p>
                </div>
                <nav className="flex flex-wrap gap-2 text-xs">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
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
