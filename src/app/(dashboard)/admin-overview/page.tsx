import Link from "next/link";
import { LayoutDashboard, FlaskConical, DollarSign, Users2, Flag, FileText } from "lucide-react";

interface TeamSummary {
    name: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    metric: string;
    label: string;
    status: "good" | "warning" | "risk";
}

interface RecentReport {
    id: string;
    title: string;
    team: string;
    when: string;
}

const teamSummaries: TeamSummary[] = [
    {
        name: "Research",
        icon: FlaskConical,
        metric: "3",
        label: "active studies",
        status: "good",
    },
    {
        name: "Finance",
        icon: DollarSign,
        metric: "41%",
        label: "budget spent",
        status: "good",
    },
    {
        name: "Outreach & CRM",
        icon: Users2,
        metric: "5.4K",
        label: "contacts added this week",
        status: "warning",
    },
    {
        name: "Opposition",
        icon: Flag,
        metric: "68%",
        label: "narrative risk",
        status: "risk",
    },
];

const recentReports: RecentReport[] = [
    {
        id: "RES-041",
        title: "Weekly tracking poll – national vote intent",
        team: "Research",
        when: "Today",
    },
    {
        id: "FIN-024",
        title: "Q2 budget vs actuals – national campaign",
        team: "Finance",
        when: "Yesterday",
    },
    {
        id: "OUT-019",
        title: "Ward-level door-to-door coverage – Nairobi",
        team: "Outreach & CRM",
        when: "2 days ago",
    },
    {
        id: "AD-OPP-221",
        title: "Opposition cost of living attack – Nairobi",
        team: "Opposition",
        when: "2 days ago",
    },
];

export default function AdminOverviewPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-blue-600" />
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Org CRM Overview</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            One place for leadership to see what each team is doing across the CRM.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teamSummaries.map((team) => {
                    const Icon = team.icon;
                    return (
                        <div
                            key={team.name}
                            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                    {team.name}
                                </span>
                                <div
                                    className={`p-2 rounded-lg ${
                                        team.status === "good"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : team.status === "warning"
                                            ? "bg-amber-50 text-amber-700"
                                            : "bg-red-50 text-red-600"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {team.metric}
                                </h3>
                                <span className="text-xs text-slate-500">{team.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-900">Team quick links</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    Jump into each team workspace, reports, and audit logs.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <Link href="/research" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Research</Link>
                    <Link href="/comms" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Comms</Link>
                    <Link href="/finance" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Finance</Link>
                    <Link href="/call-center" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Call Center</Link>
                    <Link href="/media" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Media</Link>
                    <Link href="/admin/audit-trail" className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Audit Trail</Link>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Recent reports across teams
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Latest outputs from research, finance, outreach/CRM, and opposition monitoring.
                        </p>
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
                                    Team
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    When
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentReports.map((report) => (
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
                                        {report.team}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {report.when}
                                    </td>
                                    <td className="px-6 py-3 text-right text-xs">
                                        <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">
                                            <FileText className="h-3.5 w-3.5" />
                                            View
                                        </button>
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

