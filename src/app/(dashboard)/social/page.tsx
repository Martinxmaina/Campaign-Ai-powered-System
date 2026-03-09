import { Hash, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

const platforms = [
    { name: "Twitter / X", mentions: "12.4K", sentiment: 62, color: "bg-sky-500" },
    { name: "Facebook", mentions: "8.7K", sentiment: 71, color: "bg-blue-600" },
    { name: "TikTok", mentions: "5.2K", sentiment: 54, color: "bg-pink-500" },
    { name: "Instagram", mentions: "3.8K", sentiment: 78, color: "bg-violet-500" },
];

const trendingTopics = [
    { topic: "#UngaPrices", mentions: "45.2K", trend: "+320%", sentiment: "negative" },
    { topic: "#CBCReform", mentions: "28.4K", trend: "+180%", sentiment: "mixed" },
    { topic: "#HealthcareForAll", mentions: "22.1K", trend: "+95%", sentiment: "positive" },
    { topic: "#JobCreation", mentions: "18.9K", trend: "+67%", sentiment: "positive" },
    { topic: "#InfrastructureDev", mentions: "15.3K", trend: "+42%", sentiment: "mixed" },
];

const recentMentions = [
    { platform: "Twitter / X", user: "@KenyaYouthVoice", content: "The candidate's healthcare policy is exactly what Kenyans need right now. Finally someone addressing real issues! #HealthcareForAll", time: "12 min ago", sentiment: "positive" },
    { platform: "Facebook", user: "Nairobi Political Forum", content: "Community meeting in Kibera well received. Good turnout and engagement from residents on housing policy.", time: "45 min ago", sentiment: "positive" },
    { platform: "TikTok", user: "@politicaljunkie254", content: "Breaking down the candidate's stance on CBC reform - do they really have a plan? Let's analyze...", time: "2 hours ago", sentiment: "neutral" },
];

export default function SocialListeningPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Social Listening</h1>
                <p className="text-sm text-slate-500 mt-0.5">Monitor political conversations and trends across platforms.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {platforms.map((p) => (
                    <div key={p.name} className="stat-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3"><div className={`w-2 h-2 rounded-full ${p.color}`} /><span className="text-sm font-medium text-slate-900">{p.name}</span></div>
                        <div className="flex items-baseline gap-2 mb-3"><h3 className="text-2xl font-bold text-slate-900">{p.mentions}</h3><span className="text-xs text-slate-500">mentions</span></div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p.sentiment}%` }} /></div>
                            <span className="text-xs font-semibold text-emerald-600">{p.sentiment}%</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">positive sentiment</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Hash className="h-4 w-4 text-blue-600" /> Trending Topics</h3></div>
                    <div className="divide-y divide-slate-50">
                        {trendingTopics.map((topic) => (
                            <div key={topic.topic} className="px-6 py-3 flex items-center justify-between table-row-hover">
                                <div><p className="text-sm font-semibold text-blue-600">{topic.topic}</p><p className="text-xs text-slate-500">{topic.mentions} mentions</p></div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{topic.trend}</span>
                                    {topic.sentiment === "positive" && <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />}
                                    {topic.sentiment === "negative" && <ThumbsDown className="h-3.5 w-3.5 text-red-500" />}
                                    {topic.sentiment === "mixed" && <Minus className="h-3.5 w-3.5 text-amber-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-blue-600" /> Recent Mentions</h3></div>
                    <div className="divide-y divide-slate-50">
                        {recentMentions.map((m, i) => (
                            <div key={i} className="px-6 py-4 table-row-hover">
                                <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><span className="text-[11px] font-medium text-slate-400">{m.platform}</span><span className="text-xs font-semibold text-blue-600">{m.user}</span></div><span className="text-[10px] text-slate-400">{m.time}</span></div>
                                <p className="text-sm text-slate-700 leading-relaxed">{m.content}</p>
                                <div className="mt-2"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${m.sentiment === "positive" ? "bg-emerald-50 text-emerald-600" : m.sentiment === "negative" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>{m.sentiment}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
