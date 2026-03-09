import { AlertTriangle, Flag, TrendingUp, Users, Filter } from "lucide-react";

interface OppositionActor {
    name: string;
    role: string;
    party: string;
    shareOfVoice: string;
    sentiment: "Positive" | "Neutral" | "Negative";
}

interface OppositionNarrative {
    id: string;
    theme: string;
    region: string;
    intensity: string;
    lastSeen: string;
}

const actors: OppositionActor[] = [
    {
        name: "Opposition Coalition A",
        role: "Main coalition",
        party: "Coalition A",
        shareOfVoice: "42%",
        sentiment: "Negative",
    },
    {
        name: "Candidate X",
        role: "Presidential candidate",
        party: "Coalition A",
        shareOfVoice: "31%",
        sentiment: "Negative",
    },
    {
        name: "Candidate Y",
        role: "Regional challenger",
        party: "Party B",
        shareOfVoice: "18%",
        sentiment: "Neutral",
    },
];

const narratives: OppositionNarrative[] = [
    {
        id: "OPP-NAR-12",
        theme: "Cost of living failure",
        region: "Nationwide · stronger in urban",
        intensity: "High",
        lastSeen: "15 min ago",
    },
    {
        id: "OPP-NAR-09",
        theme: "Youth unemployment",
        region: "Nairobi, Mombasa, Kisumu",
        intensity: "Medium",
        lastSeen: "1 hour ago",
    },
    {
        id: "OPP-NAR-05",
        theme: "Corruption allegations",
        region: "National TV & blogs",
        intensity: "Low",
        lastSeen: "Yesterday",
    },
];

export default function OppositionPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Opposition Tracker</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Who the opposition is, how loud they are, and what narratives they are pushing.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-700">
                    <Filter className="h-4 w-4" />
                    Filter by region
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                Key opposition actors
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Share of voice and perceived sentiment vs our campaign.
                            </p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-slate-500">
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                        Actor
                                    </th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                        Party
                                    </th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                        Share of voice
                                    </th>
                                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                        Sentiment
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {actors.map((actor) => (
                                    <tr key={actor.name} className="table-row-hover">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-900/80 flex items-center justify-center text-[11px] text-white font-bold">
                                                    <Flag className="h-3 w-3" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {actor.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {actor.role}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-slate-600">
                                            {actor.role}
                                        </td>
                                        <td className="px-6 py-3 text-xs text-slate-600">
                                            {actor.party}
                                        </td>
                                        <td className="px-6 py-3 text-xs text-slate-900 font-semibold">
                                            {actor.shareOfVoice}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    actor.sentiment === "Negative"
                                                        ? "bg-red-50 text-red-600"
                                                        : actor.sentiment === "Positive"
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {actor.sentiment}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                Risk monitor
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Narrative risk level based on opposition activity.
                            </p>
                        </div>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="p-6 space-y-3 text-xs text-slate-600">
                        <p>
                            Use this page together with{" "}
                            <span className="font-semibold text-slate-900">
                                Opposition Ads
                            </span>{" "}
                            and{" "}
                            <span className="font-semibold text-slate-900">
                                Social Listening
                            </span>{" "}
                            to brief the comms team on what the opposition is saying.
                        </p>
                        <div>
                            <p className="font-medium text-slate-900 mb-1">
                                Overall narrative risk
                            </p>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: "68%" }} />
                            </div>
                            <p className="mt-1 text-slate-500">
                                Moderate – focused on cost of living and youth unemployment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Active opposition narratives
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Themes you should track and answer in your own messaging.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Narrative
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Region
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Intensity
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Last seen
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {narratives.map((narrative) => (
                                <tr key={narrative.id} className="table-row-hover">
                                    <td className="px-6 py-3">
                                        <p className="font-medium text-slate-900">
                                            {narrative.theme}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {narrative.id}
                                        </p>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {narrative.region}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                narrative.intensity === "High"
                                                    ? "bg-red-50 text-red-600"
                                                    : narrative.intensity === "Medium"
                                                    ? "bg-amber-50 text-amber-700"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {narrative.intensity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {narrative.lastSeen}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

