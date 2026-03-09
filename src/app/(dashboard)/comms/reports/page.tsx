const commsReports = [
    {
        id: "COM-028",
        title: "Weekly cross-channel message performance",
        channel: "Email, SMS, WhatsApp",
        period: "Week 10 · 2026",
        owner: "Comms Ops",
    },
    {
        id: "COM-024",
        title: "Narrative response effectiveness",
        channel: "Social + Field",
        period: "Feb 2026",
        owner: "Message Strategy",
    },
    {
        id: "COM-020",
        title: "Event invite funnel performance",
        channel: "SMS + Email",
        period: "Jan 2026",
        owner: "Engagement",
    },
];

export default function CommsReportsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">Comms reports</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Messaging outcomes, channel analytics, and campaign report outputs.
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
                            {commsReports.map((report) => (
                                <tr key={report.id} className="table-row-hover">
                                    <td className="px-6 py-3">
                                        <p className="font-medium text-slate-900">{report.title}</p>
                                        <p className="text-[10px] text-slate-400">{report.id}</p>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{report.channel}</td>
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

