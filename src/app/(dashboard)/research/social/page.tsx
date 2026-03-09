import Link from "next/link";

export default function ResearchSocialPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">Social listening</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    High-level view of sentiment and narratives, tailored for the research team.
                </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-xs text-slate-600 space-y-3">
                <p>
                    This page should be used together with{" "}
                    <Link href="/social" className="text-blue-600 hover:underline">
                        Social Listening
                    </Link>{" "}
                    and{" "}
                    <Link href="/sentiment" className="text-blue-600 hover:underline">
                        Sentiment
                    </Link>{" "}
                    dashboards to brief the campaign on narrative shifts.
                </p>
                <p>
                    In a full implementation, key charts and tables from those dashboards
                    would be embedded here with filters and saved views for the research
                    team.
                </p>
            </div>
        </div>
    );
}

