const users = [
    { name: "Sarah Jenkins", email: "sarah.jenkins@campaign.org", role: "Super Admin" },
    { name: "Daniel Mwangi", email: "daniel.mwangi@campaign.org", role: "Campaign Manager" },
    { name: "Amina Yusuf", email: "amina.yusuf@campaign.org", role: "Research" },
    { name: "John Otieno", email: "john.otieno@campaign.org", role: "Comms" },
    { name: "Grace Njeri", email: "grace.njeri@campaign.org", role: "Finance" },
];

export default function AdminUsersPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">Users & roles</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Mocked view of RBAC assignments based on the project specification.
                </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Name
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Email
                                </th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wide">
                                    Role
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.email} className="table-row-hover">
                                    <td className="px-6 py-3 text-sm font-medium text-slate-900">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-600">
                                        {user.role}
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

