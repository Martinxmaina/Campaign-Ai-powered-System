import { Download, LineChart, FileText, Filter } from "lucide-react";

interface ResearchReport {
    id: string;
    title: string;
    type: string;
    fieldworkWindow: string;
    owner: string;
    status: "Draft" | "In Review" | "Final";
}

const researchReports: ResearchReport[] = [
    {
        id: "RES-041",
        title: "Weekly Tracking Poll – National Vote Intent",
        type: "Quant · Tracking",
        fieldworkWindow: "1–7 Mar 2026",
        owner: "Polling Unit",
        status: "Final",
    },
    {
        id: "RES-036",
        title: "Youth Focus Groups – Hustler Fund Perception",
        type: "Qual · Focus Groups",
        fieldworkWindow: "18–20 Feb 2026",
        owner: "Insights Team",
        status: "In Review",
    },
    {
        id: "RES-032",
        title: "Issue Salience – Cost of Living vs Jobs",
        type: "Quant · Issue Tracker",
        fieldworkWindow: "Jan 2026",
        owner: "Research Team",
        status: "Draft",
    },
];

export default function ResearchPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Research Team Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Polling trends, survey performance, and research deliverables.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-700">
                    <Download className="h-4 w-4" /> Export research pack
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Team objective</p>
                    <p className="text-sm text-slate-700 mt-1">
                        Deliver reliable voter insight through polling, studies, and narrative tracking.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Today priorities</p>
                    <p className="text-sm text-slate-700 mt-1">
                        Finalize tracking poll brief, review focus-group transcripts, and update issue salience.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Recent output</p>
                    <p className="text-sm text-slate-700 mt-1">
                        Weekly vote-intent report and county narrative snapshot published.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                Headline polling trend
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Vote intent (%, national) – last 8 waves.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <LineChart className="h-3.5 w-3.5" />
                            Mock chart
                        </div>
                    </div>
                    <div className="p-6 text-xs text-slate-500">
                        Polling chart placeholder – ready for integration with real data.
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Survey health
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Completion rates and quotas coverage for active surveys.
                        </p>
                    </div>
                    <div className="p-6 space-y-3 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700">
                                National tracking poll
                            </span>
                            <span className="text-emerald-600 font-semibold">94% complete</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "94%" }} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700">
                                Youth booster sample
                            </span>
                            <span className="text-amber-600 font-semibold">72% complete</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: "72%" }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Research reports
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Generated outputs the research team publishes to the campaign.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Report
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Type
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Fieldwork
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Owner
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Status
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {researchReports.map((report) => (
                                <tr key={report.id} className="table-row-hover cursor-pointer">
                                    <td className="px-6 py-3">
                                        <p className="font-medium text-slate-900">
                                            {report.title}
                                        </p>
                                        <p className="text-[10px] text-slate-400">{report.id}</p>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {report.type}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {report.fieldworkWindow}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {report.owner}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                report.status === "Final"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : report.status === "In Review"
                                                    ? "bg-amber-50 text-amber-700"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {report.status}
                                        </span>
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

