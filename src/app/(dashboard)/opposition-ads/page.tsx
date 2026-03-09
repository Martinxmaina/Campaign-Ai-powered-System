import { Download, Filter, PlayCircle, ExternalLink } from "lucide-react";

interface OppositionAd {
    id: string;
    campaign: string;
    platform: string;
    spend: string;
    impressions: string;
    objective: string;
    status: "Active" | "Paused" | "Completed";
}

const oppositionAds: OppositionAd[] = [
    {
        id: "AD-OPP-221",
        campaign: "Cost of living attack – Nairobi",
        platform: "Facebook/Instagram",
        spend: "KSh 4.2M",
        impressions: "3.1M",
        objective: "Persuasion",
        status: "Active",
    },
    {
        id: "AD-OPP-204",
        campaign: "Corruption allegation explainer",
        platform: "YouTube",
        spend: "KSh 2.8M",
        impressions: "1.4M",
        objective: "Narrative",
        status: "Completed",
    },
    {
        id: "AD-OPP-197",
        campaign: "Youth turnout GOTV",
        platform: "TikTok",
        spend: "KSh 1.1M",
        impressions: "980K",
        objective: "Turnout",
        status: "Active",
    },
];

export default function OppositionAdsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Opposition Ads</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Which ads the opposition is running, on which platforms, and at what scale.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black transition-colors shadow-sm">
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Campaign
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Platform
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Spend
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Impressions
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Objective
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Status
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {oppositionAds.map((ad) => (
                                <tr key={ad.id} className="table-row-hover cursor-pointer">
                                    <td className="px-6 py-3">
                                        <p className="font-medium text-slate-900">
                                            {ad.campaign}
                                        </p>
                                        <p className="text-[10px] text-slate-400">{ad.id}</p>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {ad.platform}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-900 font-semibold">
                                        {ad.spend}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {ad.impressions}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {ad.objective}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                ad.status === "Active"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : ad.status === "Completed"
                                                    ? "bg-slate-100 text-slate-600"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                            {ad.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right text-xs">
                                        <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 mr-1">
                                            <PlayCircle className="h-3.5 w-3.5" />
                                            Preview
                                        </button>
                                        <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Open
                                        </button>
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

