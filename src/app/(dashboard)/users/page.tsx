import { Users, Plus, Search, MoreHorizontal, Clock } from "lucide-react";

const roles = [
    { name: "Super Admin", count: 1, color: "bg-red-500" },
    { name: "Campaign Manager", count: 3, color: "bg-blue-500" },
    { name: "Research Team", count: 5, color: "bg-emerald-500" },
    { name: "Communications", count: 4, color: "bg-violet-500" },
    { name: "Call Center", count: 8, color: "bg-amber-500" },
    { name: "Media & Content", count: 3, color: "bg-pink-500" },
];

const users = [
    { name: "Sarah Wanjiku", email: "sarah.w@company.co.ke", role: "Super Admin", status: "Active", lastActive: "2 mins ago", avatar: "SW" },
    { name: "Otieno Mark", email: "m.otieno@company.co.ke", role: "Research Team", status: "Active", lastActive: "4 hours ago", avatar: "OM" },
    { name: "Chloe Achieng", email: "c.achieng@company.co.ke", role: "Communications", status: "Inactive", lastActive: "2 days ago", avatar: "CA" },
    { name: "David Kimani", email: "d.kimani@company.co.ke", role: "Campaign Manager", status: "Active", lastActive: "30 min ago", avatar: "DK" },
    { name: "Faith Mwangi", email: "f.mwangi@company.co.ke", role: "Call Center", status: "Active", lastActive: "1 hour ago", avatar: "FM" },
    { name: "Hassan Omar", email: "h.omar@company.co.ke", role: "Media & Content", status: "Active", lastActive: "3 hours ago", avatar: "HO" },
];

export default function UsersPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-xl font-bold text-slate-900">Users & Permissions</h1><p className="text-sm text-slate-500 mt-0.5">Manage team members and role-based access.</p></div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"><Plus className="h-4 w-4" /> Add User</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {roles.map((r) => (
                    <div key={r.name} className="stat-card bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${r.color} mx-auto mb-2`} />
                        <h3 className="text-xl font-bold text-slate-900">{r.count}</h3>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{r.name}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Team Members</h3>
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" /><input className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Search users..." /></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-100 text-left text-slate-500">
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">User</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Role</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Status</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Last Active</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide" />
                        </tr></thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((u) => (
                                <tr key={u.email} className="table-row-hover cursor-pointer group">
                                    <td className="px-6 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">{u.avatar}</div><div><p className="font-medium text-slate-900">{u.name}</p><p className="text-[10px] text-slate-400">{u.email}</p></div></div></td>
                                    <td className="px-6 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{u.role}</span></td>
                                    <td className="px-6 py-3"><span className={`text-xs font-medium flex items-center gap-1.5 ${u.status === "Active" ? "text-emerald-600" : "text-slate-400"}`}><span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-emerald-500" : "bg-slate-300"}`} />{u.status}</span></td>
                                    <td className="px-6 py-3 text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" />{u.lastActive}</td>
                                    <td className="px-6 py-3"><button className="p-1 rounded hover:bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
