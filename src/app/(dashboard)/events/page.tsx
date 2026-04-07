"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Users, Calendar, Clock, Plus, ChevronRight } from "lucide-react";
import { getEvents, type Event } from "@/lib/supabase/queries";

function formatEventDate(value: string | null) {
    if (!value) return "No date";
    return new Date(value).toLocaleString();
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [referenceNow] = useState(() => Date.now());

    useEffect(() => {
        getEvents(100)
            .then(setEvents)
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = events.filter((event) => {
            if (!event.event_date) return false;
            const date = new Date(event.event_date);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;

        return [
            { label: "Total Events", value: String(events.length), icon: Calendar, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
            { label: "This Month", value: String(thisMonth), icon: Clock, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
            { label: "Total Attendees", value: String(events.reduce((sum, event) => sum + (event.attendee_count ?? 0), 0)), icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
            { label: "Wards Covered", value: String(new Set(events.map((event) => event.ward).filter(Boolean)).size), icon: MapPin, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
        ];
    }, [events]);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-900">Campaign Events</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Plan, manage, and track campaign events from the database.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="h-4 w-4" /> New Event
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="stat-card bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{stat.label}</span>
                                <div className={`p-2 ${stat.iconBg} ${stat.iconColor} rounded-lg`}><Icon className="h-4 w-4" /></div>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-900">{loading ? "—" : stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    Loading events from the database...
                </div>
            ) : events.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                    <h2 className="text-sm font-medium text-slate-900">No events yet</h2>
                    <p className="mt-1 text-xs text-slate-500">Add event rows to the `events` table to populate this page.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-4 py-4 border-b border-slate-100 sm:px-6">
                        <h2 className="text-sm font-semibold text-slate-900">Scheduled Events</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {events.map((event) => {
                            const upcoming = event.event_date ? new Date(event.event_date).getTime() >= referenceNow : false;
                            return (
                                <div key={event.id} className="px-4 py-4 flex items-start gap-4 table-row-hover group transition-colors sm:px-6">
                                    <div className={`mt-1 h-12 w-1 rounded-full ${upcoming ? "bg-blue-500" : "bg-slate-300"}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium text-sm text-slate-900">{event.title ?? "Untitled event"}</p>
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${upcoming ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                                                {upcoming ? "Upcoming" : "Past"}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatEventDate(event.event_date)}</span>
                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location ?? event.ward ?? "Location not set"}</span>
                                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {(event.attendee_count ?? 0).toLocaleString()}</span>
                                        </div>
                                        {event.notes && <p className="mt-2 text-xs text-slate-600">{event.notes}</p>}
                                    </div>
                                    <ChevronRight className="mt-1 h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
