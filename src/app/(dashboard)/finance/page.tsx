import { ArrowDownRight, ArrowUpRight, Download, PieChart, Wallet } from "lucide-react";
import ExecutiveKpiCard from "@/components/charts/ExecutiveKpiCard";
import ExecutiveBarChart from "@/components/charts/ExecutiveBarChart";
import ExecutiveLineChart from "@/components/charts/ExecutiveLineChart";

interface FinanceStat {
    label: string;
    value: string;
    change: string;
    positive: boolean;
}

interface ExpenseCategory {
    name: string;
    amount: string;
    share: number;
}

interface CashFlowPoint {
    period: string;
    inflow: number;
    outflow: number;
}

interface FinanceReport {
    id: string;
    title: string;
    type: string;
    period: string;
    owner: string;
    status: "Draft" | "Final" | "In Review";
}

const stats: FinanceStat[] = [
    { label: "Total Campaign Budget", value: "KSh 1.2B", change: "+4.5% vs plan", positive: true },
    { label: "Actual Spend to Date", value: "KSh 480M", change: "41% of budget", positive: true },
    { label: "Committed Spend", value: "KSh 220M", change: "26 contracts", positive: true },
    { label: "Runway Remaining", value: "142 days", change: "-8 days vs baseline", positive: false },
];

const expenseBreakdown: ExpenseCategory[] = [
    { name: "Media & Ads", amount: "KSh 210M", share: 40 },
    { name: "Field Operations", amount: "KSh 120M", share: 23 },
    { name: "Logistics & Travel", amount: "KSh 65M", share: 13 },
    { name: "Research & Polling", amount: "KSh 40M", share: 8 },
    { name: "Compliance & Legal", amount: "KSh 25M", share: 6 },
    { name: "Other", amount: "KSh 20M", share: 10 },
];

const cashFlow: CashFlowPoint[] = [
    { period: "Jan", inflow: 95, outflow: 72 },
    { period: "Feb", inflow: 84, outflow: 76 },
    { period: "Mar", inflow: 112, outflow: 92 },
    { period: "Apr", inflow: 128, outflow: 104 },
    { period: "May", inflow: 122, outflow: 110 },
    { period: "Jun", inflow: 138, outflow: 124 },
];

const financeReports: FinanceReport[] = [
    {
        id: "FIN-024",
        title: "Q2 Budget vs Actuals – National Campaign",
        type: "Budget Report",
        period: "Apr–Jun 2026",
        owner: "Finance Team",
        status: "Final",
    },
    {
        id: "FIN-021",
        title: "Media Spend vs Plan by Region",
        type: "Media Spend",
        period: "Jan–Mar 2026",
        owner: "Media Finance",
        status: "In Review",
    },
    {
        id: "FIN-018",
        title: "Cash Flow Forecast to Election Day",
        type: "Forecast",
        period: "Jul 2026 – Aug 2027",
        owner: "Treasury",
        status: "Draft",
    },
];

export default function FinancePage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Finance Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Budget, spend, runway, and financial health of the campaign.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-700">
                    <Download className="h-4 w-4" /> Export finance pack
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                        Team objective
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                        Keep campaign spend on plan while preserving runway and compliance.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                        Today priorities
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                        Review media contracts, update runway, and approve pending transactions.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                        Recent output
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                        Q2 budget vs actuals pack delivered to leadership.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <ExecutiveKpiCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        change={stat.change}
                        positive={stat.positive}
                        icon={<Wallet className="h-4 w-4" />}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ExecutiveBarChart
                        title="Expense breakdown by category"
                        subtitle="How campaign shillings are allocated across major cost centers"
                        data={expenseBreakdown}
                        xKey="name"
                        yKey="share"
                        valueLabel="% of total spend"
                        color="#2563eb"
                    />
                </div>

                <div>
                    <ExecutiveLineChart
                        title="Monthly cash flow"
                        subtitle="Inflows vs outflows (KSh M) for the current half-year"
                        data={cashFlow}
                        xKey="period"
                        series={[
                            { dataKey: "inflow", label: "Inflows (KSh M)", color: "#22c55e" },
                            { dataKey: "outflow", label: "Outflows (KSh M)", color: "#ef4444" },
                        ]}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Finance reports
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Structured reports ready to share with leadership and auditors.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black transition-colors shadow-sm">
                        <Download className="h-3.5 w-3.5" />
                        Export all
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Report
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Type
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Period
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Owner
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Status
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {financeReports.map((report) => (
                                <tr key={report.id} className="table-row-hover cursor-pointer">
                                    <td className="px-6 py-3">
                                        <p className="font-medium text-slate-900">
                                            {report.title}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {report.id}
                                        </p>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {report.type}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {report.period}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {report.owner}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                report.status === "Final"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : report.status === "In Review"
                                                    ? "bg-amber-50 text-amber-700"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right text-xs">
                                        <button className="px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">
                                            View
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

