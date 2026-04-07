"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { ExecutiveBarChartProps } from "./types";

export default function ExecutiveBarChart<TData extends object>(
    props: ExecutiveBarChartProps<TData>,
) {
    const {
        title,
        subtitle,
        data,
        xKey,
        yKey,
        valueLabel,
        color = "#2563eb",
        horizontal = false,
    } = props;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3 md:px-6 md:py-4">
                <h3 className="text-sm font-semibold text-slate-900">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="h-60 p-3 md:h-64 md:p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout={horizontal ? "vertical" : "horizontal"}
                        margin={{ top: 8, right: 24, left: 8, bottom: 16 }}
                    >
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        {horizontal ? (
                            <>
                                <XAxis type="number" tickLine={false} axisLine={false} />
                                <YAxis
                                    dataKey={xKey as string}
                                    type="category"
                                    tickLine={false}
                                    axisLine={false}
                                    width={80}
                                />
                            </>
                        ) : (
                            <>
                                <XAxis
                                    dataKey={xKey as string}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 11, fill: "#64748b" }}
                                />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                            </>
                        )}
                        <Tooltip
                            cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: any) => [
                                value,
                                valueLabel || (yKey as string),
                            ]}
                        />
                        {valueLabel && <Legend />}
                        <Bar
                            dataKey={yKey as string}
                            name={valueLabel}
                            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                            fill={color}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
