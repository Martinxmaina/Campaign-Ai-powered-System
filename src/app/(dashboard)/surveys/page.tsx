import { ListChecks, Plus, BarChart3, Users, Clock, ChevronRight, CheckCircle, Circle } from "lucide-react";

const surveyStats = [
    { label: "Total Surveys", value: "14", icon: ListChecks, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Total Responses", value: "42.8K", icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Active Surveys", value: "4", icon: BarChart3, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { label: "Avg Completion", value: "72%", icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
];

const surveys = [
    { name: "Voter Priority Poll – Q4 2024", status: "active", responses: 12400, questions: 8, completion: 78, created: "Oct 1, 2024" },
    { name: "Healthcare Access Survey", status: "active", responses: 8200, questions: 12, completion: 65, created: "Sep 28, 2024" },
    { name: "Youth Employment Feedback", status: "active", responses: 5600, questions: 10, completion: 82, created: "Sep 25, 2024" },
    { name: "Infrastructure Satisfaction – Nairobi", status: "completed", responses: 15400, questions: 6, completion: 91, created: "Sep 15, 2024" },
    { name: "Education Reform Opinion Poll", status: "draft", responses: 0, questions: 15, completion: 0, created: "Oct 5, 2024" },
];

export default function SurveysPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-xl font-bold text-slate-900">Survey Builder</h1><p className="text-sm text-slate-500 mt-0.5">Create, distribute, and analyze voter surveys.</p></div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"><Plus className="h-4 w-4" /> New Survey</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {surveyStats.map((stat) => {
                    const Icon = stat.icon; return (
                        <div key={stat.label} className="stat-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3"><span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{stat.label}</span><div className={`p-2 ${stat.iconBg} ${stat.iconColor} rounded-lg`}><Icon className="h-4 w-4" /></div></div>
                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900">All Surveys</h3></div>
                <div className="divide-y divide-slate-50">
                    {surveys.map((s) => (
                        <div key={s.name} className="px-6 py-4 flex items-center gap-4 table-row-hover cursor-pointer group">
                            <div className={`flex-shrink-0 p-2 rounded-lg ${s.status === "active" ? "bg-emerald-50 text-emerald-600" : s.status === "completed" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                                {s.status === "completed" ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-900">{s.name}</p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500"><span>{s.questions} questions</span><span>{s.responses.toLocaleString()} responses</span><span>{s.created}</span></div>
                            </div>
                            <div className="flex items-center gap-3">
                                {s.completion > 0 && (<div className="flex items-center gap-2 w-32"><div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-600 h-full rounded-full" style={{ width: `${s.completion}%` }} /></div><span className="text-xs font-semibold text-slate-700 w-8 text-right">{s.completion}%</span></div>)}
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${s.status === "active" ? "bg-emerald-50 text-emerald-600" : s.status === "completed" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>{s.status}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
