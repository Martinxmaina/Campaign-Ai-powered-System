"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Clock, Wifi, WifiOff, RefreshCw, Check } from "lucide-react";

type SyncState = "idle" | "syncing" | "done" | "offline";

export default function FieldLayout({ children }: { children: React.ReactNode }) {
    const [syncState, setSyncState] = useState<SyncState>("idle");
    const [pendingCount, setPendingCount] = useState(0);
    const [online, setOnline] = useState(true);

    const refreshPending = useCallback(async () => {
        try {
            const { getPendingReports } = await import("@/lib/field/offline-sync");
            const q = await getPendingReports();
            setPendingCount(q.length);
        } catch { /* indexedDB not ready */ }
    }, []);

    const doSync = useCallback(async () => {
        if (!navigator.onLine) return;
        setSyncState("syncing");
        try {
            const { flushQueue } = await import("@/lib/field/offline-sync");
            const { synced } = await flushQueue();
            if (synced > 0) setSyncState("done");
            else setSyncState("idle");
            await refreshPending();
            setTimeout(() => setSyncState("idle"), 2500);
        } catch {
            setSyncState("idle");
        }
    }, [refreshPending]);

    useEffect(() => {
        // Register service worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then((reg) => {
                // Request background sync permission
                if ("SyncManager" in window) {
                    (reg as ServiceWorkerRegistration & { sync: { register(tag: string): Promise<void> } }).sync
                        .register("sync-field-reports").catch(() => {});
                }
            }).catch(console.error);

            navigator.serviceWorker.addEventListener("message", (event) => {
                if (event.data?.type === "SYNC_FIELD_REPORTS") doSync();
            });
        }

        // Online/offline
        setOnline(navigator.onLine);
        const onOnline = () => { setOnline(true); doSync(); };
        const onOffline = () => { setOnline(false); setSyncState("offline"); };
        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);

        refreshPending();

        return () => {
            window.removeEventListener("online", onOnline);
            window.removeEventListener("offline", onOffline);
        };
    }, [doSync, refreshPending]);

    // Re-check pending after every navigation (catches new submissions)
    const pathname = usePathname();
    useEffect(() => { refreshPending(); }, [pathname, refreshPending]);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col" style={{ maxWidth: 480, margin: "0 auto" }}>
            {/* Offline banner */}
            {!online && (
                <div className="bg-amber-500 text-white text-xs font-semibold text-center py-2 px-4 flex items-center justify-center gap-2">
                    <WifiOff className="h-3.5 w-3.5 shrink-0" />
                    Offline — ripoti zitahifadhiwa hapa hapa
                </div>
            )}

            {/* Pending sync banner */}
            {online && pendingCount > 0 && (
                <button
                    onClick={doSync}
                    disabled={syncState === "syncing"}
                    className="bg-blue-600 text-white text-xs font-semibold text-center py-2 px-4 flex items-center justify-center gap-2 w-full"
                >
                    {syncState === "syncing"
                        ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Inatuma ripoti...</>
                        : syncState === "done"
                        ? <><Check className="h-3.5 w-3.5" /> Zimetumwa!</>
                        : <><RefreshCw className="h-3.5 w-3.5" /> {pendingCount} {pendingCount === 1 ? "report" : "reports"} zinasubiri — gonga kutuma</>
                    }
                </button>
            )}

            <main className="flex-1 overflow-y-auto pb-20">{children}</main>
            <BottomNav pendingCount={pendingCount} online={online} />
        </div>
    );
}

function BottomNav({ pendingCount, online }: { pendingCount: number; online: boolean }) {
    const pathname = usePathname();

    const tabs = [
        { href: "/field", label: "Nyumbani", labelEn: "Home", icon: Home },
        { href: "/field/report", label: "Ripoti", labelEn: "Report", icon: FileText },
        { href: "/field/history", label: "Historia", labelEn: "History", icon: Clock },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex shadow-lg"
            style={{ maxWidth: 480, margin: "0 auto", left: "50%", transform: "translateX(-50%)", right: "auto", width: "100%" }}>
            {tabs.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex-1 flex flex-col items-center justify-center py-3 relative transition-colors ${active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        <div className="relative">
                            <Icon className={`h-5 w-5 mb-0.5 ${active ? "text-blue-600" : "text-slate-400"}`} />
                            {href === "/field/history" && pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {pendingCount > 9 ? "9+" : pendingCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">{label}</span>
                    </Link>
                );
            })}
            {/* Online indicator */}
            <div className="absolute top-2 right-2">
                {online
                    ? <Wifi className="h-3 w-3 text-emerald-500" />
                    : <WifiOff className="h-3 w-3 text-red-400" />
                }
            </div>
        </nav>
    );
}
