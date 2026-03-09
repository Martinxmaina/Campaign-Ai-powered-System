import { Shield, AlertTriangle, Clock, Zap } from "lucide-react";

const alerts = [
    { level: "critical", title: "Disinformation Campaign Detected", description: "Coordinated social media attack targeting Nakuru voters with false healthcare claims.", time: "15 min ago", source: "Twitter / X" },
    { level: "warning", title: "Opposition Ad Surge", description: "Opposition spending on Facebook ads increased 340% in Nairobi County.", time: "2 hours ago", source: "Facebook Ads Library" },
    { level: "info", title: "Narrative Shift Detected", description: "Cost of living discourse shifting from criticism to solution-oriented conversation among youth.", time: "4 hours ago", source: "TikTok" },
];

const activeThreats = [
    { threat: "False healthcare policy claims", status: "Responding", region: "Nakuru", severity: 85 },
    { threat: "Doctored campaign event photos", status: "Monitoring", region: "Mombasa", severity: 62 },
    { threat: "Voter suppression messaging", status: "Escalated", region: "Kisumu", severity: 92 },
];

const counterNarratives = [
    { topic: "Healthcare Access", status: "Active", reach: "450K", effectiveness: 78 },
    { topic: "Job Creation Plan", status: "Active", reach: "320K", effectiveness: 85 },
    { topic: "Infrastructure Record", status: "Draft", reach: "—", effectiveness: 0 },
];

export default function WarRoomPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-red-50 rounded-lg"><Shield className="h-4 w-4 text-red-600" /></div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">War Room</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Real-time threat monitoring and rapid response.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Live Monitoring
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" /><h3 className="text-sm font-semibold text-slate-900">Live Alerts</h3></div>
                <div className="divide-y divide-slate-50">
                    {alerts.map((alert, i) => (
                        <div key={i} className="px-6 py-4 flex items-start gap-4 table-row-hover">
                            <div className={`flex-shrink-0 p-2 rounded-lg ${alert.level === "critical" ? "bg-red-50 text-red-600" : alert.level === "warning" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}><AlertTriangle className="h-4 w-4" /></div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${alert.level === "critical" ? "bg-red-50 text-red-600" : alert.level === "warning" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>{alert.level}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{alert.time}</span><span>Source: {alert.source}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900">Active Threats</h3></div>
                    <div className="divide-y divide-slate-50">
                        {activeThreats.map((t, i) => (
                            <div key={i} className="px-6 py-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-slate-900">{t.threat}</p>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.status === "Escalated" ? "bg-red-50 text-red-600" : t.status === "Responding" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>{t.status}</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-2">Region: {t.region}</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${t.severity > 80 ? "bg-red-500" : t.severity > 60 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${t.severity}%` }} /></div>
                                    <span className="text-xs font-semibold text-slate-700">{t.severity}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900">Counter-Narratives</h3></div>
                    <div className="divide-y divide-slate-50">
                        {counterNarratives.map((cn, i) => (
                            <div key={i} className="px-6 py-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-slate-900">{cn.topic}</p>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cn.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{cn.status}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span>Reach: {cn.reach}</span>
                                    {cn.effectiveness > 0 && <span className="text-emerald-600 font-semibold">{cn.effectiveness}% effective</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
