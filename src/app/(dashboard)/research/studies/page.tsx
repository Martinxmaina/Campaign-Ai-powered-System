const studies = [
    {
        name: "National tracking poll",
        type: "Quantitative",
        status: "Field complete",
        owner: "Polling Unit",
    },
    {
        name: "Youth jobs deep dive",
        type: "Qualitative",
        status: "Analysis in progress",
        owner: "Insights Team",
    },
    {
        name: "County issues segmentation",
        type: "Quantitative",
        status: "Design",
        owner: "Research Team",
    },
];

export default function ResearchStudiesPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">Active studies</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Overview of live and planned research projects.
                </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Study
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Type
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Status
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Owner
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {studies.map((study) => (
                                <tr key={study.name} className="table-row-hover">
                                    <td className="px-6 py-3 text-sm font-medium text-slate-900">
                                        {study.name}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {study.type}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {study.status}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {study.owner}
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

