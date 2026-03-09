interface FinanceReport {
    id: string;
    title: string;
    type: string;
    period: string;
    owner: string;
    status: "Draft" | "Final" | "In Review";
}

const reports: FinanceReport[] = [
    {
        id: "FIN-024",
        title: "Q2 budget vs actuals – national campaign",
        type: "Budget Report",
        period: "Apr–Jun 2026",
        owner: "Finance Team",
        status: "Final",
    },
    {
        id: "FIN-021",
        title: "Media spend vs plan by region",
        type: "Media Spend",
        period: "Jan–Mar 2026",
        owner: "Media Finance",
        status: "In Review",
    },
    {
        id: "FIN-018",
        title: "Cash flow forecast to election day",
        type: "Forecast",
        period: "Jul 2026 – Aug 2027",
        owner: "Treasury",
        status: "Draft",
    },
];

export default function FinanceReportsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">Finance reports</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Structured financial outputs to share with leadership and auditors.
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
                                    Period
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
                                        {report.period}
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

