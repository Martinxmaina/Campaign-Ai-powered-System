import { MessageSquare, Send, Mail, Clock, Plus, Search } from "lucide-react";

const stats = [
    { label: "Messages Sent", value: "1.2M", icon: Send, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Response Rate", value: "18.4%", icon: MessageSquare, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Active Campaigns", value: "8", icon: Mail, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { label: "Avg Response Time", value: "4.2h", icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
];

const campaigns = [
    { name: "Town Hall Invitation – Nairobi", channel: "Email", status: "Active", sent: "120K", opened: "82%", responded: "12%", date: "Oct 8, 2024" },
    { name: "Healthcare Policy Update", channel: "SMS", status: "Active", sent: "85K", opened: "—", responded: "24%", date: "Oct 6, 2024" },
    { name: "Youth Rally Reminder – Mombasa", channel: "WhatsApp", status: "Completed", sent: "45K", opened: "91%", responded: "38%", date: "Oct 4, 2024" },
    { name: "Volunteer Signup Drive", channel: "Email", status: "Draft", sent: "—", opened: "—", responded: "—", date: "Oct 10, 2024" },
    { name: "Voter Registration Nudge", channel: "SMS", status: "Scheduled", sent: "200K", opened: "—", responded: "—", date: "Oct 12, 2024" },
];

export default function MessagingPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-xl font-bold text-slate-900">Messaging Campaigns</h1><p className="text-sm text-slate-500 mt-0.5">Create and manage SMS, email, and WhatsApp campaigns.</p></div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"><Plus className="h-4 w-4" /> New Campaign</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon; return (
                        <div key={stat.label} className="stat-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3"><span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{stat.label}</span><div className={`p-2 ${stat.iconBg} ${stat.iconColor} rounded-lg`}><Icon className="h-4 w-4" /></div></div>
                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Campaign List</h3>
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" /><input className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Search campaigns..." /></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-100 text-left text-slate-500">
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Campaign</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Channel</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Status</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Sent</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Opened</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Responded</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-50">
                            {campaigns.map((c) => (
                                <tr key={c.name} className="table-row-hover cursor-pointer">
                                    <td className="px-6 py-3"><p className="font-medium text-slate-900">{c.name}</p><p className="text-[10px] text-slate-400">{c.date}</p></td>
                                    <td className="px-6 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.channel === "Email" ? "bg-violet-50 text-violet-600" : c.channel === "SMS" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>{c.channel}</span></td>
                                    <td className="px-6 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === "Active" ? "bg-emerald-50 text-emerald-600" : c.status === "Completed" ? "bg-slate-100 text-slate-500" : c.status === "Draft" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>{c.status}</span></td>
                                    <td className="px-6 py-3 text-slate-600">{c.sent}</td>
                                    <td className="px-6 py-3 text-slate-600">{c.opened}</td>
                                    <td className="px-6 py-3 font-semibold text-blue-600">{c.responded}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
