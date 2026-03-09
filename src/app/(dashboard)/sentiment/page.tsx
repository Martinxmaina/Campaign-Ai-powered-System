import { HeartPulse, ThumbsUp, ThumbsDown, Minus, TrendingUp, TrendingDown, MapPin } from "lucide-react";

const overallSentiment = { positive: 62, neutral: 24, negative: 14 };

const regionSentiment = [
    { region: "Nairobi", positive: 68, neutral: 20, negative: 12 },
    { region: "Mombasa", positive: 72, neutral: 18, negative: 10 },
    { region: "Kisumu", positive: 45, neutral: 30, negative: 25 },
    { region: "Nakuru", positive: 58, neutral: 25, negative: 17 },
    { region: "Eldoret", positive: 65, neutral: 22, negative: 13 },
    { region: "Machakos", positive: 55, neutral: 28, negative: 17 },
];

const topicSentiment = [
    { topic: "Healthcare Policy", positive: 78, trend: "+12%", up: true },
    { topic: "Job Creation", positive: 72, trend: "+8%", up: true },
    { topic: "Cost of Living", positive: 35, trend: "-5%", up: false },
    { topic: "Education Reform", positive: 62, trend: "+3%", up: true },
    { topic: "Infrastructure", positive: 68, trend: "+15%", up: true },
    { topic: "Security", positive: 48, trend: "-2%", up: false },
];

export default function SentimentPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-pink-50 rounded-lg"><HeartPulse className="h-4 w-4 text-pink-600" /></div>
                <div><h1 className="text-xl font-bold text-slate-900">Sentiment Overview</h1><p className="text-sm text-slate-500 mt-0.5">Track voter sentiment across regions, topics, and time.</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                    <ThumbsUp className="h-7 w-7 text-emerald-500 mx-auto mb-2" />
                    <h3 className="text-3xl font-bold text-emerald-600">{overallSentiment.positive}%</h3>
                    <p className="text-sm text-slate-500 font-medium">Positive</p>
                </div>
                <div className="stat-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                    <Minus className="h-7 w-7 text-amber-500 mx-auto mb-2" />
                    <h3 className="text-3xl font-bold text-amber-600">{overallSentiment.neutral}%</h3>
                    <p className="text-sm text-slate-500 font-medium">Neutral</p>
                </div>
                <div className="stat-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                    <ThumbsDown className="h-7 w-7 text-red-500 mx-auto mb-2" />
                    <h3 className="text-3xl font-bold text-red-600">{overallSentiment.negative}%</h3>
                    <p className="text-sm text-slate-500 font-medium">Negative</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" />Sentiment by Region</h3></div>
                    <div className="divide-y divide-slate-50">
                        {regionSentiment.map((r) => (
                            <div key={r.region} className="px-6 py-4">
                                <p className="text-sm font-semibold text-slate-900 mb-2">{r.region}</p>
                                <div className="flex h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500" style={{ width: `${r.positive}%` }} />
                                    <div className="bg-amber-400" style={{ width: `${r.neutral}%` }} />
                                    <div className="bg-red-500" style={{ width: `${r.negative}%` }} />
                                </div>
                                <div className="flex justify-between mt-1.5 text-[10px] font-medium">
                                    <span className="text-emerald-600">{r.positive}% pos</span>
                                    <span className="text-amber-600">{r.neutral}% neutral</span>
                                    <span className="text-red-500">{r.negative}% neg</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900">Sentiment by Topic</h3></div>
                    <div className="divide-y divide-slate-50">
                        {topicSentiment.map((t) => (
                            <div key={t.topic} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900 mb-1">{t.topic}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${t.positive >= 60 ? "bg-emerald-500" : t.positive >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${t.positive}%` }} /></div>
                                        <span className="text-xs font-semibold text-slate-700">{t.positive}%</span>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium flex items-center gap-0.5 ${t.up ? "text-emerald-600" : "text-red-500"}`}>
                                    {t.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{t.trend}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
