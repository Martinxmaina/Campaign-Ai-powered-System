import ExecutiveBarChart from "@/components/charts/ExecutiveBarChart";

interface CallCenterStat {
    label: string;
    value: string;
}

interface CallVolumePoint {
    day: string;
    totalCalls: number;
    answeredRate: number;
}

interface CallCategoryShare {
    category: string;
    share: number;
}

const callStats: CallCenterStat[] = [
    { label: "Calls today", value: "1,260" },
    { label: "Avg handle time", value: "4m 08s" },
    { label: "Surveys completed", value: "354" },
    { label: "Follow-ups flagged", value: "102" },
];

const callVolume: CallVolumePoint[] = [
    { day: "Mon", totalCalls: 980, answeredRate: 82 },
    { day: "Tue", totalCalls: 1120, answeredRate: 79 },
    { day: "Wed", totalCalls: 1340, answeredRate: 81 },
    { day: "Thu", totalCalls: 1410, answeredRate: 83 },
    { day: "Fri", totalCalls: 1260, answeredRate: 80 },
    { day: "Sat", totalCalls: 760, answeredRate: 77 },
    { day: "Sun", totalCalls: 540, answeredRate: 75 },
];

const callCategories: CallCategoryShare[] = [
    { category: "Cost of living & prices", share: 34 },
    { category: "Jobs & opportunities", share: 22 },
    { category: "Service delivery issues", share: 18 },
    { category: "Supporter & volunteering", share: 16 },
    { category: "Other / misc", share: 10 },
];

export default function CallCenterPage() {
    const today = callVolume[4];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Call Center workspace</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Call logging, constituent feedback, and survey entry for operators.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                        Team objective
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                        Capture voter concerns accurately and route urgent issues to the
                        right teams.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                        Today priorities
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                        Reduce callback backlog and improve first-call resolution.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                        Recent output
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                        Daily issue digest shared with comms and policy teams.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {callStats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"
                    >
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                            {stat.label}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ExecutiveBarChart
                        title="Calls this week"
                        subtitle={`Total calls handled and answer rate by day · Today · ${today.totalCalls.toLocaleString()} calls · ${today.answeredRate}% answered`}
                        data={callVolume}
                        xKey="day"
                        yKey="totalCalls"
                        valueLabel="Total calls"
                        color="#2563eb"
                    />
                </div>

                <div>
                    <ExecutiveBarChart
                        title="Call reasons today"
                        subtitle="Distribution of top call categories"
                        data={callCategories}
                        xKey="category"
                        yKey="share"
                        valueLabel="% of calls"
                        color="#16a34a"
                        horizontal
                    />
                </div>
            </div>
        </div>
    );
}

