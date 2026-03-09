import { Search, Filter, Download, Plus, ChevronRight } from "lucide-react";

const voters = [
    {
        id: "#8829-XJ",
        name: "Sarah Njeri",
        email: "sarah.njeri@example.com",
        phone: "+254 712 345 678",
        tags: ["Donor", "Volunteer"],
        lastContact: "2 days ago (Email)",
        segment: "High Propensity",
        avatar: "SN",
    },
    {
        id: "#4412-MK",
        name: "Michael Otieno",
        email: "michael.otieno@example.com",
        phone: "+254 701 234 567",
        tags: ["Undecided"],
        lastContact: "1 week ago (Door)",
        segment: "Swing Voter",
        avatar: "MO",
    },
    {
        id: "#9931-JW",
        name: "James Kamau",
        email: "james.kamau@example.com",
        phone: "+254 733 555 001",
        tags: ["VIP", "Host"],
        lastContact: "Live (SMS Chat)",
        segment: "Influencer",
        avatar: "JK",
    },
    {
        id: "#5567-LP",
        name: "Lucy Wambui",
        email: "lucy.wambui@example.com",
        phone: "+254 720 111 222",
        tags: ["Volunteer"],
        lastContact: "3 days ago (Phone)",
        segment: "Supporter",
        avatar: "LW",
    },
    {
        id: "#2211-RT",
        name: "Robert Tanui",
        email: "robert.tanui@example.com",
        phone: "+254 719 999 888",
        tags: ["Donor", "VIP"],
        lastContact: "Yesterday (Event)",
        segment: "High Propensity",
        avatar: "RT",
    },
    {
        id: "#7788-AS",
        name: "Amani Salim",
        email: "amani.salim@example.com",
        phone: "+254 736 123 890",
        tags: ["New"],
        lastContact: "Never",
        segment: "Cold Lead",
        avatar: "AS",
    },
];

export default function DatabasePage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Outreach Database</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Manage contacts, outreach segments, and interaction history across channels.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-700"><Download className="h-4 w-4" /> Export</button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"><Plus className="h-4 w-4" /> Add Voter</button>
                </div>
            </div>

            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none shadow-sm"
                        placeholder="Search by name, ID, or segment..."
                    />
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-700"><Filter className="h-4 w-4" /> Filters</button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-100 text-left text-slate-500 bg-slate-50/50">
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Contact</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Email</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Phone</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Segment</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Tags</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">Last Contact</th>
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide" />
                        </tr></thead>
                        <tbody className="divide-y divide-slate-50">
                            {voters.map((v) => (
                                <tr key={v.id} className="table-row-hover cursor-pointer group">
                                    <td className="px-6 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">{v.avatar}</div><div><p className="font-medium text-slate-900">{v.name}</p><p className="text-[10px] text-slate-400">{v.id}</p></div></div></td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{v.email}</td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{v.phone}</td>
                                    <td className="px-6 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{v.segment}</span></td>
                                    <td className="px-6 py-3"><div className="flex gap-1">{v.tags.map((t) => (<span key={t} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{t}</span>))}</div></td>
                                    <td className="px-6 py-3 text-xs text-slate-500">{v.lastContact}</td>
                                    <td className="px-6 py-3"><ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
