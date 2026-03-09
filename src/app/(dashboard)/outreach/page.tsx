import { Download, Users, Filter, CalendarDays, BarChart3, ArrowUpRight } from "lucide-react";
import ExecutiveKpiCard from "@/components/charts/ExecutiveKpiCard";
import ExecutiveBarChart from "@/components/charts/ExecutiveBarChart";
import ExecutiveLineChart from "@/components/charts/ExecutiveLineChart";

interface OutreachFunnelStat {
    label: string;
    value: string;
    change: string;
}

interface OutreachContactSegment {
    name: string;
    count: string;
    trend: "up" | "down" | "flat";
}

interface OutreachReport {
    id: string;
    title: string;
    channel: string;
    period: string;
    owner: string;
}

const funnelStats: OutreachFunnelStat[] = [
    { label: "New contacts this week", value: "5,420", change: "+18% vs last week" },
    { label: "Active conversations", value: "1,238", change: "+9% vs last week" },
    { label: "Follow-ups overdue", value: "312", change: "-6% vs last week" },
    { label: "Reactivation wins", value: "184", change: "+22% vs last week" },
];

const segments: OutreachContactSegment[] = [
    { name: "Core supporters", count: "82,340", trend: "up" },
    { name: "Persuadables", count: "56,120", trend: "up" },
    { name: "Undecided", count: "34,980", trend: "flat" },
    { name: "At risk", count: "12,411", trend: "down" },
];

const weeklyContacts = [
    { week: "W1", contacts: 3820 },
    { week: "W2", contacts: 4100 },
    { week: "W3", contacts: 4380 },
    { week: "W4", contacts: 4620 },
    { week: "W5", contacts: 5010 },
    { week: "W6", contacts: 5420 },
    { week: "W7", contacts: 5720 },
    { week: "W8", contacts: 5940 },
];

const outreachReports: OutreachReport[] = [
    {
        id: "OUT-019",
        title: "Ward-level door-to-door coverage – Nairobi",
        channel: "Field",
        period: "Feb 2026",
        owner: "Ground Game",
    },
    {
        id: "OUT-016",
        title: "SMS mobilisation for voter registration",
        channel: "SMS",
        period: "Jan–Feb 2026",
        owner: "Comms",
    },
    {
        id: "OUT-013",
        title: "Re-engagement of lapsed volunteers",
        channel: "Email",
        period: "Q4 2025",
        owner: "Organising",
    },
];

export default function OutreachPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Outreach & CRM</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Communication CRM for the field and comms teams – who we are talking to, on which channels.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                    <CalendarDays className="h-4 w-4" />
                    Open messaging calendar
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Team objective</p>
                    <p className="text-sm text-slate-700 mt-1">
                        Coordinate communication and field touchpoints to move contacts into action.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Today priorities</p>
                    <p className="text-sm text-slate-700 mt-1">
                        Push cost-of-living message set, clear follow-up backlog, and update segment plans.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Recent output</p>
                    <p className="text-sm text-slate-700 mt-1">
                        Campaign response report delivered for email, SMS, and field engagement.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {funnelStats.map((stat) => (
                    <ExecutiveKpiCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        change={stat.change}
                        positive={!stat.change.startsWith("-")}
                        icon={<Users className="h-4 w-4" />}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ExecutiveBarChart
                        title="Contacts & segments"
                        subtitle="Key audience groups the outreach and comms teams work with"
                        data={segments.map((segment) => ({
                            name: segment.name,
                            contacts: parseInt(segment.count.replace(/,/g, ""), 10),
                        }))}
                        xKey="name"
                        yKey="contacts"
                        valueLabel="Contacts"
                        color="#2563eb"
                        horizontal
                    />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <ExecutiveLineChart
                        title="New contacts over time"
                        subtitle="Weekly growth in outreach contacts"
                        data={weeklyContacts}
                        xKey="week"
                        series={[
                            {
                                dataKey: "contacts",
                                label: "New contacts",
                                color: "#16a34a",
                            },
                        ]}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Outreach & campaign reports
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Summaries the comms and organising teams use to brief leadership.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            <Filter className="h-3.5 w-3.5" />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black transition-colors shadow-sm">
                            <Download className="h-3.5 w-3.5" />
                            Export all
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Report
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Channel
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Period
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Owner
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {outreachReports.map((report) => (
                                <tr key={report.id} className="table-row-hover cursor-pointer">
                                    <td className="px-6 py-3">
                                        <p className="font-medium text-slate-900">
                                            {report.title}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {report.id}
                                        </p>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {report.channel}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {report.period}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {report.owner}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

