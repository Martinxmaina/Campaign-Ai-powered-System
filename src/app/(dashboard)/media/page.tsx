const mediaCards = [
    { label: "Assets uploaded this week", value: "184" },
    { label: "Creatives in review", value: "27" },
    { label: "Approved for flighting", value: "63" },
];

export default function MediaPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Media & Content workspace</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    View of creative assets, messaging themes, and performance for the
                    media team.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Team objective</p>
                    <p className="text-sm text-slate-700 mt-1">
                        Deliver high-quality content that reinforces campaign narrative.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Today priorities</p>
                    <p className="text-sm text-slate-700 mt-1">
                        Finalize creative variants and publish response clips for trending issues.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">Recent output</p>
                    <p className="text-sm text-slate-700 mt-1">
                        Multi-channel content pack delivered to communications team.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mediaCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"
                    >
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                            {card.label}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

