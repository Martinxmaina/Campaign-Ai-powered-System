import { Filter } from "lucide-react";

const logs = [
    {
        timestamp: "2026-03-09 10:14",
        actor: "Sarah Jenkins",
        role: "Super Admin",
        action: "Updated role permissions",
        module: "Users & Roles",
        record: "User: john.otieno@campaign.org",
        result: "Success",
    },
    {
        timestamp: "2026-03-09 09:22",
        actor: "Grace Njeri",
        role: "Finance",
        action: "Exported finance report",
        module: "Finance Reports",
        record: "FIN-024",
        result: "Success",
    },
    {
        timestamp: "2026-03-09 08:57",
        actor: "Amina Yusuf",
        role: "Research",
        action: "Viewed opposition narrative report",
        module: "Opposition Tracker",
        record: "OPP-NAR-12",
        result: "Success",
    },
];

export default function AdminAuditTrailPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                        Worklog / Audit Trail
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Platform-level activity across all teams and modules.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Timestamp</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Actor</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Role</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Action</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Module</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Record</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.map((log) => (
                                <tr key={`${log.timestamp}-${log.record}`} className="table-row-hover">
                                    <td className="px-6 py-3 text-xs text-slate-600">{log.timestamp}</td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{log.actor}</td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{log.role}</td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{log.action}</td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{log.module}</td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{log.record}</td>
                                    <td className="px-6 py-3 text-xs">
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                                            {log.result}
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

