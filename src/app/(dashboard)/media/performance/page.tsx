const placements = [
    {
        name: "Cost of living explainer – TV + social cutdowns",
        channel: "TV + Social",
        reach: "3.2M",
        completion: "74%",
    },
    {
        name: "Youth jobs 30s spot – digital only",
        channel: "Digital",
        reach: "1.1M",
        completion: "62%",
    },
];

export default function MediaPerformancePage() {
    return (
        <div className="p-6 space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">Content performance</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    High-level view of how key pieces of content are performing.
                </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Placement
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Channel
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Estimated reach
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Video completion
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {placements.map((placement) => (
                                <tr key={placement.name} className="table-row-hover">
                                    <td className="px-6 py-3 text-sm font-medium text-slate-900">
                                        {placement.name}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {placement.channel}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {placement.reach}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {placement.completion}
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

