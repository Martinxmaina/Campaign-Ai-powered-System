"use client";

import { useState } from "react";
import {
    Smile, MousePointerClick, Newspaper, DollarSign,
    Send, Heart, Mic, AlertTriangle, ArrowUpRight, RefreshCw,
} from "lucide-react";
import KenyaHeatmap from "@/components/dashboard/KenyaHeatmap";

// ─── Data ────────────────────────────────────────────────────────────────────
const stats = [
    { label: "Voter Sentiment", value: "68%", change: "+5.2%", icon: Smile, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Message Engagement", value: "4.2%", change: "+0.8%", icon: MousePointerClick, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { label: "Media Hits", value: "124", change: "Target: 150", icon: Newspaper, iconBg: "bg-amber-50", iconColor: "text-amber-600", neutral: true },
    { label: "Total Donors", value: "12,482", change: "+12%", icon: DollarSign, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
];

const activityFeed = [
    { title: "Email Blast Dispatched", description: '"Town Hall Invitation" sent to 120,000 voters across Nairobi County.', time: "2 hours ago", icon: Send, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { title: "New Fundraising Milestone", description: "Reached KSh 300M goal for the quarter. Major fundraiser held in Mombasa.", time: "5 hours ago", icon: Heart, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { title: "Media Mention Recorded", description: "Candidate interviewed on Citizen TV regarding Kisumu infrastructure projects.", time: "Yesterday", icon: Mic, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { title: "War Room Alert", description: "Disinformation campaign detected on social media targeting Nakuru voters.", time: "2 days ago", icon: AlertTriangle, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
];

const emailPerformance = [
    { label: "Donation Match Alert", rate: 91 },
    { label: "Weekly Update #14", rate: 82 },
    { label: "Endorsement Announcement", rate: 74 },
    { label: "Policy Position Paper", rate: 65 },
];

const keyIssues = [
    { label: "Unga Prices", size: "xl", color: "bg-blue-600 text-white" },
    { label: "Healthcare", size: "lg", color: "bg-blue-100 text-blue-700" },
    { label: "Job Creation", size: "md", color: "bg-blue-100 text-blue-700" },
    { label: "Education (CBC)", size: "sm", color: "bg-slate-100 text-slate-600" },
    { label: "Housing", size: "md", color: "bg-violet-100 text-violet-700" },
    { label: "Infrastructure", size: "xs", color: "bg-slate-100 text-slate-600" },
    { label: "Environment", size: "sm", color: "bg-emerald-100 text-emerald-700" },
    { label: "Taxation", size: "xs", color: "bg-slate-100 text-slate-500" },
];

// Days 1–30 sentiment data (two series)
const sentimentData = {
    weekly: [52, 55, 54, 58, 60, 57, 62, 61, 63, 65, 64, 67, 68, 66, 68],
    monthly: [48, 50, 51, 53, 52, 55, 56, 55, 58, 60, 59, 61, 63, 62, 64, 65, 63, 66, 67, 65, 67, 68, 67, 69, 68, 70, 68, 70, 71, 68],
};

function SentimentChart({ period }: { period: "weekly" | "monthly" }) {
    const data = sentimentData[period];
    const max = 100;
    const min = 40;
    const range = max - min;
    const w = 1000;
    const h = 200;
    const pad = { t: 16, b: 24, l: 32, r: 16 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;

    const pts = data.map((v, i) => {
        const x = pad.l + (i / (data.length - 1)) * chartW;
        const y = pad.t + chartH - ((v - min) / range) * chartH;
        return `${x},${y}`;
    });
    const polyline = pts.join(" ");
    const areaPath = `M${pts[0]} L${pts.slice(1).join(" L")} L${pad.l + chartW},${pad.t + chartH} L${pad.l},${pad.t + chartH} Z`;

    // Y grid lines
    const yLines = [50, 60, 70, 80];

    return (
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
            <defs>
                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Y grid */}
            {yLines.map((v) => {
                const y = pad.t + chartH - ((v - min) / range) * chartH;
                return (
                    <g key={v}>
                        <line x1={pad.l} y1={y} x2={pad.l + chartW} y2={y} stroke="#f1f5f9" strokeWidth="1.5" />
                        <text x={pad.l - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}%</text>
                    </g>
                );
            })}
            {/* Area */}
            <path d={areaPath} fill="url(#grad)" />
            {/* Line */}
            <polyline points={polyline} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {/* Dots — only every 5th point */}
            {data.map((v, i) => {
                if (i % 5 !== 0 && i !== data.length - 1) return null;
                const [x, y] = pts[i].split(",").map(Number);
                return (
                    <g key={i}>
                        <circle cx={x} cy={y} r="5" fill="white" stroke="#2563eb" strokeWidth="2" />
                        <text x={x} y={y - 10} textAnchor="middle" fontSize="9" fill="#2563eb" fontWeight="bold">{v}%</text>
                    </g>
                );
            })}
            {/* X labels */}
            {(period === "weekly"
                ? ["W1", "W3", "W6", "W9", "W12", "W15"]
                : ["D1", "D5", "D10", "D15", "D20", "D25", "D30"]
            ).map((label, i, arr) => {
                const x = pad.l + (i / (arr.length - 1)) * chartW;
                return (
                    <text key={label} x={x} y={h - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">{label}</text>
                );
            })}
        </svg>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [chartPeriod, setChartPeriod] = useState<"weekly" | "monthly">("monthly");
    const [lastRefreshed, setLastRefreshed] = useState("Just now");
    const [activeActivity, setActiveActivity] = useState<number | null>(null);

    const sizeClasses: Record<string, string> = {
        xl: "px-4 py-2.5 text-base font-bold",
        lg: "px-4 py-2 text-sm font-bold",
        md: "px-3 py-1.5 text-sm font-semibold",
        sm: "px-2.5 py-1 text-xs font-medium",
        xs: "px-2 py-1 text-[11px] font-medium",
    };

    return (
        <div className="p-6 space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Campaign Overview</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Real-time campaign performance and key metrics</p>
                </div>
                <button
                    onClick={() => setLastRefreshed("Just now")}
                    className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh · {lastRefreshed}
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="stat-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{stat.label}</span>
                                <div className={`p-2 ${stat.iconBg} ${stat.iconColor} rounded-lg`}><Icon className="h-4 w-4" /></div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.neutral ? "text-slate-400" : "text-emerald-600"}`}>
                                    {!stat.neutral && <ArrowUpRight className="h-3 w-3" />}
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sentiment Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Voter Sentiment Trends</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Positive sentiment % over time</p>
                    </div>
                    <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-lg">
                        {(["weekly", "monthly"] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setChartPeriod(p)}
                                className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all capitalize ${chartPeriod === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-52 w-full">
                    <SentimentChart period={chartPeriod} />
                </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kenya Heatmap */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">Kenya Voter Support by County</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Click a county for details · Hover to view support %</p>
                    </div>
                    <KenyaHeatmap />
                </div>

                {/* Activity Feed */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Campaign Activity Feed</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Recent events</p>
                        </div>
                        <button className="text-blue-600 text-xs font-semibold hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        {activityFeed.map((item, i) => {
                            const Icon = item.icon;
                            const isActive = activeActivity === i;
                            return (
                                <div
                                    key={item.title}
                                    onClick={() => setActiveActivity(isActive ? null : i)}
                                    className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isActive ? "border-blue-200 bg-blue-50" : "border-transparent hover:border-slate-100 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                                        <p className={`text-xs text-slate-500 leading-relaxed mt-0.5 transition-all ${isActive ? "" : "line-clamp-1"}`}>
                                            {item.description}
                                        </p>
                                        <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Email Performance */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-slate-900">Email Performance</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Open rate comparison</p>
                    </div>
                    <div className="space-y-4">
                        {emailPerformance.map((email) => {
                            const color = email.rate >= 85 ? "bg-emerald-500" : email.rate >= 70 ? "bg-blue-600" : "bg-amber-500";
                            return (
                                <div key={email.label} className="group">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-medium text-slate-700">{email.label}</span>
                                        <span className={`font-bold px-1.5 py-0.5 rounded text-white text-[10px] ${color}`}>{email.rate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className={`${color} h-full rounded-full transition-all duration-500 group-hover:brightness-110`}
                                            style={{ width: `${email.rate}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Key Issues */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-slate-900">Key Issue Trends</h3>
                        <p className="text-xs text-slate-400 mt-0.5">What voters care about</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {keyIssues.map((issue) => (
                            <button
                                key={issue.label}
                                className={`rounded-full ${issue.color} ${sizeClasses[issue.size]} hover:opacity-80 transition-opacity`}
                            >
                                {issue.label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Top Rising Theme</span>
                            <span className="text-blue-600 font-semibold">Cost of Living +15%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
