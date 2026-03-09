import { BarChart3, TrendingUp, Users, Globe, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";

const kpis = [
    { label: "Overall Reach", value: "2.4M", change: "+18.3%", up: true, icon: Globe, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Voter Contacts", value: "485K", change: "+12.1%", up: true, icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Conversion Rate", value: "3.8%", change: "-0.4%", up: false, icon: TrendingUp, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    { label: "Cost per Contact", value: "KSh 42", change: "-8.2%", up: true, icon: BarChart3, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
];

const channelPerformance = [
    { channel: "SMS Campaigns", sent: "320K", delivered: "98.2%", response: "12.4%", color: "bg-blue-500" },
    { channel: "WhatsApp", sent: "185K", delivered: "99.1%", response: "24.8%", color: "bg-emerald-500" },
    { channel: "Email Blasts", sent: "420K", delivered: "94.5%", response: "4.2%", color: "bg-violet-500" },
    { channel: "Social Ads", sent: "1.2M", delivered: "87.3%", response: "2.1%", color: "bg-amber-500" },
    { channel: "Door-to-Door", sent: "45K", delivered: "100%", response: "38.6%", color: "bg-pink-500" },
];

const countyReach = [
    { county: "Nairobi", reach: 89 },
    { county: "Mombasa", reach: 76 },
    { county: "Kisumu", reach: 72 },
    { county: "Nakuru", reach: 65 },
    { county: "Eldoret", reach: 58 },
    { county: "Machakos", reach: 52 },
];

export default function AnalyticsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Analytics & Reports</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Campaign performance metrics across all channels.</p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-700">
                    <Download className="h-4 w-4" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="stat-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{kpi.label}</span>
                                <div className={`p-2 ${kpi.iconBg} ${kpi.iconColor} rounded-lg`}><Icon className="h-4 w-4" /></div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
                                <span className={`text-xs font-medium flex items-center gap-0.5 ${kpi.up ? "text-emerald-600" : "text-red-500"}`}>
                                    {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{kpi.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900">Channel Performance</h3></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Channel</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Sent</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Delivered</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Response</th>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {channelPerformance.map((ch) => (
                                    <tr key={ch.channel} className="table-row-hover">
                                        <td className="px-6 py-3 font-medium text-slate-900 flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${ch.color}`} />{ch.channel}</td>
                                        <td className="px-6 py-3 text-slate-600">{ch.sent}</td>
                                        <td className="px-6 py-3 text-slate-600">{ch.delivered}</td>
                                        <td className="px-6 py-3 font-semibold text-blue-600">{ch.response}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-5">Reach by County</h3>
                    <div className="space-y-4">
                        {countyReach.map((c) => (
                            <div key={c.county}>
                                <div className="flex justify-between text-xs mb-1.5"><span className="font-medium text-slate-700">{c.county}</span><span className="font-semibold text-slate-900">{c.reach}%</span></div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-blue-600 h-full rounded-full" style={{ width: `${c.reach}%` }} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
