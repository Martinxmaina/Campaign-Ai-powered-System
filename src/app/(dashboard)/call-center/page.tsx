const callStats = [
    { label: "Calls today", value: "1,284" },
    { label: "Avg handle time", value: "4m 12s" },
    { label: "Surveys completed", value: "362" },
    { label: "Follow-ups flagged", value: "97" },
];

export default function CallCenterPage() {
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
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Team objective</p>
                    <p className="text-sm text-slate-700 mt-1">
                        Capture voter concerns accurately and route urgent issues to the right teams.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Today priorities</p>
                    <p className="text-sm text-slate-700 mt-1">
                        Reduce callback backlog and improve first-call resolution.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Recent output</p>
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
        </div>
    );
}

