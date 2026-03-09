const callCenterReports = [
    {
        id: "CC-012",
        title: "Weekly call reason distribution",
        period: "Week 10 · 2026",
        owner: "Call Ops",
    },
    {
        id: "CC-010",
        title: "Constituent issue escalation report",
        period: "Feb 2026",
        owner: "Support Desk",
    },
];

export default function CallCenterReportsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">Call Center reports</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Operational reporting for call volume, outcomes, and escalations.
                </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Report</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Period</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Owner</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {callCenterReports.map((report) => (
                                <tr key={report.id} className="table-row-hover">
                                    <td className="px-6 py-3">
                                        <p className="font-medium text-slate-900">{report.title}</p>
                                        <p className="text-[10px] text-slate-400">{report.id}</p>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{report.period}</td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{report.owner}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

