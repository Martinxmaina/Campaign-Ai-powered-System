"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { TeamKpi } from "./types";

interface ExecutiveKpiCardProps extends TeamKpi {
    icon?: ReactNode;
}

export default function ExecutiveKpiCard({ label, value, change, positive, icon }: ExecutiveKpiCardProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                    {label}
                </span>
                {icon && (
                    <div className="rounded-lg bg-slate-50 p-1.5 text-slate-500 md:p-2">
                        {icon}
                    </div>
                )}
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-bold text-slate-900 md:text-2xl">
                    {value}
                </h3>
                {change && (
                    <span
                        className={`text-xs font-medium flex items-center gap-0.5 ${
                            positive === undefined
                                ? "text-slate-400"
                                : positive
                                ? "text-emerald-600"
                                : "text-red-500"
                        }`}
                    >
                        {positive === undefined ? null : positive ? (
                            <ArrowUpRight className="h-3 w-3" />
                        ) : (
                            <ArrowDownRight className="h-3 w-3" />
                        )}
                        {change}
                    </span>
                )}
            </div>
        </div>
    );
}
