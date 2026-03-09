"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { TeamKpi } from "./types";

interface ExecutiveKpiCardProps extends TeamKpi {
    icon?: ReactNode;
}

export default function ExecutiveKpiCard({ label, value, change, positive, icon }: ExecutiveKpiCardProps) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                    {label}
                </span>
                {icon && (
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                        {icon}
                    </div>
                )}
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-slate-900">
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

