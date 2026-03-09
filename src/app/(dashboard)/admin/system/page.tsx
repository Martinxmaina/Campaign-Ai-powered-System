export default function AdminSystemPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">System & logs</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Placeholder for system configuration, audit logs, and monitoring.
                </p>
            </div>
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 text-xs text-slate-500">
                Connect this view later to real system logs, feature flags, and
                infrastructure health metrics.
            </div>
        </div>
    );
}

