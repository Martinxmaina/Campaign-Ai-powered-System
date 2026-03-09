const transactions = [
    {
        id: "TX-1021",
        date: "2026-03-01",
        department: "Media",
        category: "Digital ads",
        amount: "KSh 4.5M",
        status: "Approved",
    },
    {
        id: "TX-1013",
        date: "2026-02-26",
        department: "Field",
        category: "Rallies & events",
        amount: "KSh 1.2M",
        status: "Pending",
    },
    {
        id: "TX-1009",
        date: "2026-02-22",
        department: "Research",
        category: "Polling",
        amount: "KSh 650K",
        status: "Approved",
    },
];

export default function FinanceTransactionsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">Transactions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Line-item view of campaign expenses by department and category.
                </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    ID
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Date
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Department
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Category
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Amount
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="table-row-hover">
                                    <td className="px-6 py-3 text-xs text-slate-600">{tx.id}</td>
                                    <td className="px-6 py-3 text-xs text-slate-600">{tx.date}</td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {tx.department}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {tx.category}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-900 font-semibold">
                                        {tx.amount}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                tx.status === "Approved"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                            {tx.status}
                                        </span>
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

