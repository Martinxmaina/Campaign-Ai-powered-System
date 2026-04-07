"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getPrimaryElectionEvent } from "@/lib/supabase/queries";

interface Props {
    mode: "compact" | "full";
}

interface TimeLeft {
    days: number;
    hours: number;
    mins: number;
    secs: number;
    past: boolean;
}

function calcTimeLeft(targetDate: string): TimeLeft {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, past: true };
    const totalSecs = Math.floor(diff / 1000);
    return {
        days: Math.floor(totalSecs / 86400),
        hours: Math.floor((totalSecs % 86400) / 3600),
        mins: Math.floor((totalSecs % 3600) / 60),
        secs: totalSecs % 60,
        past: false,
    };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function ElectionCountdown({ mode }: Props) {
    const [eventName, setEventName] = useState<string | null>(null);
    const [eventDate, setEventDate] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        getPrimaryElectionEvent().then((ev) => {
            if (ev) {
                setEventName(ev.event_name);
                setEventDate(ev.event_date);
                setTimeLeft(calcTimeLeft(ev.event_date));
            }
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!eventDate) return;
        const interval = setInterval(() => {
            setTimeLeft(calcTimeLeft(eventDate));
        }, 1000);
        return () => clearInterval(interval);
    }, [eventDate]);

    if (!eventDate || !timeLeft) return null;

    if (mode === "compact") {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                {timeLeft.past ? (
                    <span className="font-semibold text-slate-700">{eventName} — Ended</span>
                ) : (
                    <span className="font-semibold text-slate-700">
                        {eventName}: <span className="text-blue-700 font-black">{timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.mins)}m {pad(timeLeft.secs)}s</span>
                    </span>
                )}
            </div>
        );
    }

    // full mode
    return (
        <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 opacity-75" />
                <p className="text-xs font-semibold uppercase tracking-wide opacity-75">Election Countdown</p>
            </div>
            <p className="text-sm font-bold mb-3">{eventName}</p>
            {timeLeft.past ? (
                <p className="text-2xl font-black">Election Day has passed</p>
            ) : (
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { value: timeLeft.days, label: "Days" },
                        { value: timeLeft.hours, label: "Hours" },
                        { value: timeLeft.mins, label: "Mins" },
                        { value: timeLeft.secs, label: "Secs" },
                    ].map(({ value, label }) => (
                        <div key={label} className="bg-white/20 rounded-xl p-3 text-center">
                            <p className="text-3xl font-black tabular-nums">{String(value).padStart(2, "0")}</p>
                            <p className="text-[10px] font-semibold opacity-75 mt-0.5 uppercase tracking-wide">{label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
