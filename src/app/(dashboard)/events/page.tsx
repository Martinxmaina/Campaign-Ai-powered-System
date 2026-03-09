import {
    MapPin,
    Users,
    Calendar,
    Clock,
    Plus,
    Filter,
    ChevronRight,
} from "lucide-react";

const events = [
    { id: "1", name: "Mombasa Youth Rally", date: "Oct 12, 2024", location: "Mama Ngina Waterfront", attendees: 1240, status: "Upcoming", color: "bg-blue-500" },
    { id: "2", name: "Nairobi Town Hall", date: "Oct 15, 2024", location: "KICC, Nairobi", attendees: 450, status: "Planning", color: "bg-violet-500" },
    { id: "3", name: "Kisumu Farmers Meetup", date: "Oct 18, 2024", location: "Jaramogi Oginga Odinga Sports Ground", attendees: 890, status: "Confirmed", color: "bg-emerald-500" },
    { id: "4", name: "Nakuru Business Forum", date: "Oct 22, 2024", location: "Rift Valley Conference Center", attendees: 320, status: "Upcoming", color: "bg-amber-500" },
    { id: "5", name: "Eldoret Community Outreach", date: "Oct 25, 2024", location: "Eldoret Sports Club", attendees: 670, status: "Planning", color: "bg-pink-500" },
];

const statCards = [
    { label: "Total Events", value: "24", icon: Calendar, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "This Month", value: "8", icon: Clock, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { label: "Total Attendees", value: "15.2K", icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Regions Covered", value: "12", icon: MapPin, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
];

export default function EventsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Campaign Events</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Plan, manage, and track all campaign events and rallies.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="h-4 w-4" /> New Event
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="stat-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{stat.label}</span>
                                <div className={`p-2 ${stat.iconBg} ${stat.iconColor} rounded-lg`}><Icon className="h-4 w-4" /></div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Upcoming Events</h3>
                    <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"><Filter className="h-3.5 w-3.5" /> Filter</button>
                </div>
                <div className="divide-y divide-slate-100">
                    {events.map((event) => (
                        <div key={event.id} className="px-6 py-4 flex items-center gap-4 table-row-hover cursor-pointer group transition-colors">
                            <div className={`w-1 h-12 rounded-full ${event.color}`} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm text-slate-900">{event.name}</p>
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{event.status}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.date}</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {event.attendees.toLocaleString()}</span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
