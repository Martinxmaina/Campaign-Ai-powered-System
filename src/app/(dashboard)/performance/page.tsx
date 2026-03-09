import { DollarSign, Eye, MousePointerClick, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";

const adStats = [
    { label: "Total Spend", value: "KSh 4.2M", change: "+18%", up: true, icon: DollarSign, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Total Impressions", value: "12.4M", change: "+32%", up: true, icon: Eye, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Click-Through Rate", value: "3.8%", change: "+0.6%", up: true, icon: MousePointerClick, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { label: "Cost per Click", value: "KSh 12", change: "-15%", up: true, icon: BarChart3, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
];

const campaigns = [
    { name: "Healthcare Awareness – Facebook", platform: "Facebook", spend: "KSh 1.2M", impressions: "4.2M", clicks: "168K", ctr: "4.0%", status: "active" },
    { name: "Youth Engagement – TikTok", platform: "TikTok", spend: "KSh 800K", impressions: "3.8M", clicks: "190K", ctr: "5.0%", status: "active" },
    { name: "Town Hall Promo – Twitter", platform: "Twitter", spend: "KSh 450K", impressions: "1.6M", clicks: "48K", ctr: "3.0%", status: "active" },
    { name: "Voter Registration – Google", platform: "Google", spend: "KSh 1.8M", impressions: "2.8M", clicks: "112K", ctr: "4.0%", status: "paused" },
];

const platformBreakdown = [
    { platform: "Facebook", spend: 35, color: "bg-blue-600" },
    { platform: "TikTok", spend: 25, color: "bg-pink-500" },
    { platform: "Google Ads", spend: 22, color: "bg-emerald-500" },
    { platform: "Twitter / X", spend: 12, color: "bg-sky-500" },
    { platform: "Instagram", spend: 6, color: "bg-violet-500" },
];

export default function PerformancePage() {
    return (
        <div className="p-6 space-y-6">
            <div><h1 className="text-xl font-bold text-slate-900">Ad Performance</h1><p className="text-sm text-slate-500 mt-0.5">Track ad campaigns, spending, and engagement across platforms.</p></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {adStats.map((stat) => {
                    const Icon = stat.icon; return (
                        <div key={stat.label} className="stat-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3"><span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{stat.label}</span><div className={`p-2 ${stat.iconBg} ${stat.iconColor} rounded-lg`}><Icon className="h-4 w-4" /></div></div>
                            <div className="flex items-baseline gap-2"><h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3><span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? "text-emerald-600" : "text-red-500"}`}>{stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{stat.change}</span></div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900">Active Campaigns</h3></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Campaign</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Spend</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Impressions</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">CTR</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Status</th>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {campaigns.map((c) => (
                                    <tr key={c.name} className="table-row-hover cursor-pointer">
                                        <td className="px-6 py-3"><p className="font-medium text-slate-900">{c.name}</p><p className="text-[10px] text-slate-400">{c.platform}</p></td>
                                        <td className="px-6 py-3 text-slate-600">{c.spend}</td>
                                        <td className="px-6 py-3 text-slate-600">{c.impressions}</td>
                                        <td className="px-6 py-3 font-semibold text-blue-600">{c.ctr}</td>
                                        <td className="px-6 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${c.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{c.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-5">Spend by Platform</h3>
                    <div className="space-y-4">
                        {platformBreakdown.map((p) => (
                            <div key={p.platform}>
                                <div className="flex justify-between text-xs mb-1.5"><span className="font-medium text-slate-700">{p.platform}</span><span className="font-semibold text-slate-900">{p.spend}%</span></div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className={`${p.color} h-full rounded-full`} style={{ width: `${p.spend}%` }} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
