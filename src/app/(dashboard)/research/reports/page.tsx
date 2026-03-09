interface ResearchReport {
    id: string;
    title: string;
    type: string;
    fieldworkWindow: string;
    owner: string;
    status: "Draft" | "In Review" | "Final";
}

const reports: ResearchReport[] = [
    {
        id: "RES-041",
        title: "Weekly tracking poll – national vote intent",
        type: "Quant · Tracking",
        fieldworkWindow: "1–7 Mar 2026",
        owner: "Polling Unit",
        status: "Final",
    },
    {
        id: "RES-036",
        title: "Youth focus groups – hustler fund perception",
        type: "Qual · Focus Groups",
        fieldworkWindow: "18–20 Feb 2026",
        owner: "Insights Team",
        status: "In Review",
    },
    {
        id: "RES-032",
        title: "Issue salience – cost of living vs jobs",
        type: "Quant · Issue Tracker",
        fieldworkWindow: "Jan 2026",
        owner: "Research Team",
        status: "Draft",
    },
];

export default function ResearchReportsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">Research reports</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Central list of published and in-progress research outputs.
                </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reports.map((report) => (
                                <tr key={report.id} className="table-row-hover">
                                    <td className="px-6 py-3">
                                        <p className="font-medium text-slate-900">
                                            {report.title}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {report.id}
                                        </p>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

