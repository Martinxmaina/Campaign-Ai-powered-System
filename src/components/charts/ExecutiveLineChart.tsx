"use client";

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { ExecutiveLineChartProps } from "./types";

export default function ExecutiveLineChart<TData extends Record<string, unknown>>(
    props: ExecutiveLineChartProps<TData>,
) {
    const {
        title,
        subtitle,
        data,
        xKey,
        series,
        height = 256,
        showLegend = series.length > 1,
        xTickInterval = "preserveStartEnd",
        xTickFormatter,
        showVerticalGrid = false,
        showHeader = true,
    } = props;

    return (
        <div
            className={
                showHeader
                    ? "bg-white rounded-xl border border-slate-200 shadow-sm"
                    : "bg-transparent"
            }
        >
            {showHeader && (
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-slate-500 mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            <div className={showHeader ? "p-4" : ""} style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 8, right: 16, left: 20, bottom: 28 }}
                    >
                        <CartesianGrid stroke="#f1f5f9" vertical={showVerticalGrid} />
                        <XAxis
                            dataKey={xKey as string}
                            tickLine={false}
                            axisLine={false}
                            interval={xTickInterval}
                            tickFormatter={xTickFormatter}
                            tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            width={34}
                            tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <Tooltip cursor={{ stroke: "#cbd5f5", strokeWidth: 1.5 }} />
                        {showLegend && <Legend />}
                        {series.map((s) => (
                            <Line
                                key={s.dataKey as string}
                                type="monotone"
                                dataKey={s.dataKey as string}
                                name={s.label || (s.dataKey as string)}
                                stroke={s.color || "#2563eb"}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

