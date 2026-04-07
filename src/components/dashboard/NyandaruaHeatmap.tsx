"use client";

import { useEffect, useState } from "react";
import { MapPin, BarChart2, RefreshCw } from "lucide-react";
import type { ConstituencyHeatmapData } from "@/lib/supabase/queries";

// Constituency SVG paths — approximate Nyandarua County geography
// viewBox="0 0 420 500" — north at top
const CONSTITUENCY_PATHS: Record<string, string> = {
    // Ol Jorok — northwest (borders Laikipia to north)
    "Ol Jorok":  "M 30,30 L 205,30 L 215,175 L 120,205 L 30,175 Z",
    // Ndaragwa — northeast
    "Ndaragwa":  "M 205,30 L 395,30 L 385,160 L 260,180 L 215,175 Z",
    // Kipipiri — west (Nyandarua Forest Reserve to west)
    "Kipipiri":  "M 30,175 L 120,205 L 130,345 L 30,345 Z",
    // Ol Kalou — center (county headquarters)
    "Ol Kalou":  "M 120,205 L 260,180 L 275,345 L 130,345 Z",
    // Kinangop — south (largest, Kinangop escarpment)
    "Kinangop":  "M 30,345 L 130,345 L 275,345 L 385,335 L 390,480 L 30,480 Z",
};

// Approximate label positions for each constituency
const LABEL_POSITIONS: Record<string, { x: number; y: number }> = {
    "Ol Jorok":  { x: 118, y: 105 },
    "Ndaragwa":  { x: 298, y: 100 },
    "Kipipiri":  { x: 76,  y: 270 },
    "Ol Kalou":  { x: 200, y: 265 },
    "Kinangop":  { x: 210, y: 415 },
};

const WARD_COUNTS: Record<string, number> = {
    "Ol Jorok":  4,
    "Ndaragwa":  4,
    "Kipipiri":  4,
    "Ol Kalou":  5,
    "Kinangop":  8,
};

function moodToColor(avgMood: number, reportCount: number): string {
    // If no reports, use a neutral grey-blue
    if (reportCount === 0) return "#e2e8f0";
    // Scale 1–5 → color gradient
    if (avgMood >= 4.2) return "#1d4ed8";  // deep blue — very strong
    if (avgMood >= 3.6) return "#3b82f6";  // blue — strong
    if (avgMood >= 3.0) return "#93c5fd";  // light blue — moderate
    if (avgMood >= 2.4) return "#bfdbfe";  // pale blue — weak
    return "#dbeafe";                       // very pale — low/unknown
}

function moodLabel(avgMood: number, reportCount: number): string {
    if (reportCount === 0) return "No data";
    if (avgMood >= 4.2) return "Very Strong";
    if (avgMood >= 3.6) return "Strong";
    if (avgMood >= 3.0) return "Moderate";
    if (avgMood >= 2.4) return "Weak";
    return "Very Weak";
}

interface Props {
    height?: number;
    showLegend?: boolean;
}

export default function NyandaruaHeatmap({ height = 380, showLegend = true }: Props) {
    const [heatmapData, setHeatmapData] = useState<ConstituencyHeatmapData[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredConstituency, setHoveredConstituency] = useState<string | null>(null);
    const [selectedConstituency, setSelectedConstituency] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const { getHeatmapData } = await import("@/lib/supabase/queries");
                const data = await getHeatmapData();
                setHeatmapData(data);
            } catch {
                // If table doesn't exist yet or no data — show empty state gracefully
            }
            setLoading(false);
        }
        load();
    }, []);

    // Build lookup map
    const dataByConstituency: Record<string, ConstituencyHeatmapData> = {};
    for (const d of heatmapData) {
        dataByConstituency[d.constituency] = d;
    }

    const activeConstituency = selectedConstituency ?? hoveredConstituency;
    const activeData = activeConstituency ? dataByConstituency[activeConstituency] : null;

    const totalReports = heatmapData.reduce((s, d) => s + d.reportCount, 0);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Nyandarua County</h3>
                        <p className="text-[10px] text-slate-400">5 constituencies · 25 wards · field reports heatmap</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {loading && <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin" />}
                    <span className="text-[10px] text-slate-400">{totalReports} reports</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row" style={{ minHeight: height }}>
                {/* SVG Map */}
                <div className="min-w-0 flex-1 p-3 sm:p-4">
                    <svg
                        viewBox="0 0 420 510"
                        className="w-full h-full"
                        style={{ maxHeight: height - 40 }}
                    >
                        {/* County label */}
                        <text x="210" y="502" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="system-ui">
                            Nyandarua County, Kenya
                        </text>

                        {Object.entries(CONSTITUENCY_PATHS).map(([name, path]) => {
                            const d = dataByConstituency[name];
                            const fill = moodToColor(d?.avgMood ?? 0, d?.reportCount ?? 0);
                            const isHovered = hoveredConstituency === name;
                            const isSelected = selectedConstituency === name;
                            const labelPos = LABEL_POSITIONS[name];

                            return (
                                <g key={name}>
                                    <path
                                        d={path}
                                        fill={fill}
                                        stroke={isSelected ? "#1d4ed8" : isHovered ? "#3b82f6" : "#ffffff"}
                                        strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                                        style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                                        onMouseEnter={() => setHoveredConstituency(name)}
                                        onMouseLeave={() => setHoveredConstituency(null)}
                                        onClick={() => setSelectedConstituency(selectedConstituency === name ? null : name)}
                                    />
                                    {/* Constituency name label */}
                                    <text
                                        x={labelPos.x}
                                        y={labelPos.y - 8}
                                        textAnchor="middle"
                                        fontSize="9.5"
                                        fontWeight="600"
                                        fill={d?.reportCount ? "#1e3a5f" : "#64748b"}
                                        fontFamily="system-ui"
                                        style={{ pointerEvents: "none", userSelect: "none" }}
                                    >
                                        {name}
                                    </text>
                                    {/* Report count badge */}
                                    <text
                                        x={labelPos.x}
                                        y={labelPos.y + 6}
                                        textAnchor="middle"
                                        fontSize="8"
                                        fill={d?.reportCount ? "#2563eb" : "#94a3b8"}
                                        fontFamily="system-ui"
                                        style={{ pointerEvents: "none", userSelect: "none" }}
                                    >
                                        {d?.reportCount ? `${d.reportCount} reports` : `${WARD_COUNTS[name]} wards`}
                                    </text>
                                    {/* Alert indicator */}
                                    {d?.alertReports > 0 && (
                                        <circle
                                            cx={labelPos.x + 28}
                                            cy={labelPos.y - 14}
                                            r="5"
                                            fill="#ef4444"
                                        />
                                    )}
                                </g>
                            );
                        })}

                        {/* Compass rose */}
                        <g transform="translate(385, 470)">
                            <text x="0" y="-8" textAnchor="middle" fontSize="7" fill="#94a3b8">N</text>
                            <line x1="0" y1="-6" x2="0" y2="2" stroke="#94a3b8" strokeWidth="1" />
                            <polygon points="0,-5 -2.5,-1 2.5,-1" fill="#94a3b8" />
                        </g>
                    </svg>
                </div>

                {/* Side panel */}
                <div className="flex w-full flex-col border-t border-slate-100 lg:w-48 lg:border-l lg:border-t-0">
                    {/* Detail panel when constituency selected/hovered */}
                    {activeConstituency ? (
                        <div className="flex-1 p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: moodToColor(activeData?.avgMood ?? 0, activeData?.reportCount ?? 0) }}
                                />
                                <h4 className="text-xs font-bold text-slate-900">{activeConstituency}</h4>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Reports</p>
                                    <p className="text-lg font-black text-slate-900">{activeData?.reportCount ?? 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Avg Mood</p>
                                    <p className="text-base font-bold text-blue-600">
                                        {activeData?.avgMood ? activeData.avgMood.toFixed(1) : "—"} <span className="text-xs text-slate-400">/ 5</span>
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        {moodLabel(activeData?.avgMood ?? 0, activeData?.reportCount ?? 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Positive</p>
                                    <p className="text-sm font-semibold text-emerald-600">{activeData?.positiveReports ?? 0}</p>
                                </div>
                                {(activeData?.alertReports ?? 0) > 0 && (
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">Alerts</p>
                                        <p className="text-sm font-semibold text-red-500">{activeData?.alertReports}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Wards</p>
                                    <p className="text-sm font-semibold text-slate-600">{WARD_COUNTS[activeConstituency]}</p>
                                </div>
                            </div>

                            {selectedConstituency && (
                                <button
                                    onClick={() => setSelectedConstituency(null)}
                                    className="mt-4 text-[10px] text-blue-500 hover:underline"
                                >
                                    ← Back to overview
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                                <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
                                <h4 className="text-xs font-semibold text-slate-600">All Constituencies</h4>
                            </div>
                            <div className="space-y-2.5">
                                {["Kinangop", "Ol Kalou", "Ol Jorok", "Ndaragwa", "Kipipiri"].map((name) => {
                                    const d = dataByConstituency[name];
                                    return (
                                        <button
                                            key={name}
                                            onClick={() => setSelectedConstituency(name)}
                                            className="w-full text-left group"
                                        >
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-[10px] font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{name}</span>
                                                <span className="text-[9px] text-slate-400">{d?.reportCount ?? 0}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: totalReports > 0 ? `${((d?.reportCount ?? 0) / totalReports) * 100}%` : "0%",
                                                        backgroundColor: moodToColor(d?.avgMood ?? 0, d?.reportCount ?? 0),
                                                    }}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[9px] text-slate-400 mt-3">Click a constituency on the map for details</p>
                        </div>
                    )}

                    {/* Legend */}
                    {showLegend && (
                        <div className="border-t border-slate-100 p-3">
                            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide mb-2">Voter Mood</p>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 lg:grid-cols-1">
                                {[
                                    { color: "#1d4ed8", label: "Very Strong" },
                                    { color: "#3b82f6", label: "Strong" },
                                    { color: "#93c5fd", label: "Moderate" },
                                    { color: "#bfdbfe", label: "Weak" },
                                    { color: "#e2e8f0", label: "No data" },
                                ].map(({ color, label }) => (
                                    <div key={label} className="flex items-center gap-1.5">
                                        <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: color }} />
                                        <span className="text-[9px] text-slate-500">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
