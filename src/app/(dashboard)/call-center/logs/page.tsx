const calls = [
    {
        id: "CALL-8821",
        caller: "Unknown – Nairobi",
        reason: "Cost of living complaint",
        outcome: "Logged · send follow-up SMS",
        followUp: true,
    },
    {
        id: "CALL-8814",
        caller: "Registered supporter – Eldoret",
        reason: "Wants to volunteer",
        outcome: "Referred to organising",
        followUp: false,
    },
];

export default function CallCenterLogsPage() {
    return (
        <div className="p-6 space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">Call logs</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Simple table stub for call logging and survey entry.
                </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Call ID
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Caller
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Reason
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Outcome
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Follow-up
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {calls.map((call) => (
                                <tr key={call.id} className="table-row-hover">
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {call.id}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {call.caller}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {call.reason}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {call.outcome}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {call.followUp ? "Yes" : "No"}
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

