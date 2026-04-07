"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "./types";

type WarRoomAlert = Database["public"]["Tables"]["war_room_alerts"]["Row"];
type Candidate = Database["public"]["Tables"]["candidates"]["Row"];
type Notification = Database["public"]["Tables"]["notifications"]["Row"];
const EMPTY_ALERTS: WarRoomAlert[] = [];
const EMPTY_CANDIDATES: Candidate[] = [];

function useSupabase() {
    return createClient();
}

// ─── War Room Alerts (live feed) ────���──────────────────────────────────────

export function useWarRoomAlerts(initialAlerts: WarRoomAlert[] = EMPTY_ALERTS) {
    const [liveAlerts, setLiveAlerts] = useState<WarRoomAlert[]>(EMPTY_ALERTS);
    const supabase = useSupabase();

    useEffect(() => {
        const channel = supabase
            .channel("war-room-alerts")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "war_room_alerts",
                },
                (payload: { new: Record<string, unknown> }) => {
                    const newAlert = payload.new as WarRoomAlert;
                    setLiveAlerts((prev) => [newAlert, ...prev.filter((alert) => alert.id !== newAlert.id)]);

                    // Play alert sound for critical/high severity
                    if (
                        newAlert.severity === "critical" ||
                        newAlert.severity === "high"
                    ) {
                        playAlertSound();
                        showBrowserNotification(newAlert);
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "war_room_alerts",
                },
                (payload: { new: Record<string, unknown> }) => {
                    const updated = payload.new as WarRoomAlert;
                    setLiveAlerts((prev) => [updated, ...prev.filter((alert) => alert.id !== updated.id)]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return useMemo(() => {
        const merged = new Map<string, WarRoomAlert>();

        for (const alert of initialAlerts) {
            merged.set(alert.id, alert);
        }

        for (const alert of liveAlerts) {
            merged.set(alert.id, { ...(merged.get(alert.id) ?? {}), ...alert });
        }

        return Array.from(merged.values()).sort((a, b) => {
            const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
            return bTime - aTime;
        });
    }, [initialAlerts, liveAlerts]);
}

// ─── Social Feed (live new posts) ──────────────────────────────────────────

interface AnalyzedPostPayload {
    id: string;
    sentiment: string | null;
    key_insight: string | null;
    candidates_mentioned: string[] | null;
    analyzed_at: string;
    [key: string]: unknown;
}

export function useSocialFeed() {
    const [newPosts, setNewPosts] = useState<AnalyzedPostPayload[]>([]);
    const supabase = useSupabase();

    useEffect(() => {
        const channel = supabase
            .channel("social-feed")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "analyzed_posts",
                },
                (payload: { new: Record<string, unknown> }) => {
                    setNewPosts((prev) => [payload.new as AnalyzedPostPayload, ...prev].slice(0, 100));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return { newPosts, clearNewPosts: () => setNewPosts([]) };
}

// ─── Candidate Score Updates ───────────────────────────────────────────────

export function useCandidateUpdates(initialCandidates: Candidate[] = EMPTY_CANDIDATES) {
    const [liveCandidates, setLiveCandidates] = useState<Candidate[]>(EMPTY_CANDIDATES);
    const supabase = useSupabase();

    useEffect(() => {
        const channel = supabase
            .channel("candidate-updates")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "candidates",
                },
                (payload: { new: Record<string, unknown> }) => {
                    const updated = payload.new as Candidate;
                    setLiveCandidates((prev) => [updated, ...prev.filter((candidate) => candidate.id !== updated.id)]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return useMemo(() => {
        const merged = new Map<string, Candidate>();

        for (const candidate of initialCandidates) {
            merged.set(candidate.id, candidate);
        }

        for (const candidate of liveCandidates) {
            merged.set(candidate.id, { ...(merged.get(candidate.id) ?? {}), ...candidate });
        }

        return Array.from(merged.values());
    }, [initialCandidates, liveCandidates]);
}

// ─── Notifications (realtime) ──────────────────────────────────────────────

export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const supabase = useSupabase();

    // Initial load
    useEffect(() => {
        let query = supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20);

        if (userId) {
            query = query.or(`user_id.is.null,user_id.eq.${userId}`) as typeof query;
        } else {
            query = query.is("user_id", null) as typeof query;
        }

        query.then(({ data }: { data: unknown[] | null }) => {
            if (data) setNotifications(data as Notification[]);
        });
    }, [supabase, userId]);

    // Live subscribe to new inserts
    useEffect(() => {
        const channel = supabase
            .channel("notifications-feed")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notifications" },
                (payload: { new: Record<string, unknown> }) => {
                    const n = payload.new as Notification;
                    // Only show if broadcast (null user_id) or for this user
                    if (!n.user_id || n.user_id === userId) {
                        setNotifications((prev) => [n, ...prev]);
                    }
                }
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "notifications" },
                (payload: { new: Record<string, unknown> }) => {
                    const updated = payload.new as Notification;
                    setNotifications((prev) =>
                        prev.map((n) => (n.id === updated.id ? updated : n))
                    );
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase, userId]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    function markRead(id: string) {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        supabase.from("notifications").update({ read: true }).eq("id", id).then(() => {});
    }

    function markAllRead() {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        const ids = notifications.filter((n) => !n.read).map((n) => n.id);
        if (ids.length > 0) {
            supabase.from("notifications").update({ read: true }).in("id", ids).then(() => {});
        }
    }

    return { notifications, unreadCount, markRead, markAllRead };
}

// ─── Online Presence ───────────────────────────────────────────────────────

export interface PresenceUser {
    user_id: string;
    email: string;
    full_name: string;
    role: string;
    online_at: string;
}

export function usePresence(currentUser: { id: string; email?: string; full_name?: string; role?: string } | null) {
    const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceUser>>({});
    const supabase = useSupabase();

    useEffect(() => {
        if (!currentUser?.id) return;

        const channel = supabase.channel("votercore-presence", {
            config: { presence: { key: currentUser.id } },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                const flat: Record<string, PresenceUser> = {};
                for (const [key, entries] of Object.entries(state)) {
                    const arr = entries as unknown as PresenceUser[];
                    if (arr[0]) flat[key] = arr[0];
                }
                setOnlineUsers(flat);
            })
            .subscribe(async (status: string) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({
                        user_id:   currentUser.id,
                        email:     currentUser.email     ?? "",
                        full_name: currentUser.full_name ?? "",
                        role:      currentUser.role      ?? "",
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => { supabase.removeChannel(channel); };
    }, [supabase, currentUser?.id]);

    return onlineUsers; // keyed by user_id
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function playAlertSound() {
    try {
        const audio = new Audio("/sounds/alert.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
    } catch {
        // Audio not available
    }
}

function showBrowserNotification(alert: WarRoomAlert) {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
        new Notification(`VoterCore Alert: ${alert.severity?.toUpperCase()}`, {
            body: alert.description ?? "New war room alert",
            icon: "/favicon.ico",
            tag: alert.id,
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}
