"use client";

import { createBrowserClient } from "@supabase/ssr";

const DB_NAME = "votercore-field";
const STORE_NAME = "field_reports_queue";
const DB_VERSION = 1;

export interface QueuedReport {
    id: string;
    data: Record<string, unknown>;
    queuedAt: string;
    attempts: number;
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function queueReport(data: Record<string, unknown>): Promise<void> {
    const db = await openDB();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const entry: QueuedReport = { id, data, queuedAt: new Date().toISOString(), attempts: 0 };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).add(entry);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function getPendingReports(): Promise<QueuedReport[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function removeQueuedReport(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function flushQueue(): Promise<{ synced: number; failed: number }> {
    const pending = await getPendingReports();
    if (pending.length === 0) return { synced: 0, failed: 0 };

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let synced = 0;
    let failed = 0;

    for (const entry of pending) {
        try {
            const { error } = await supabase.from("field_reports").insert(entry.data);
            if (error) throw error;
            await removeQueuedReport(entry.id);
            synced++;
        } catch {
            failed++;
        }
    }

    return { synced, failed };
}

// Submit a field report — tries Supabase first, falls back to IndexedDB queue
export async function submitFieldReport(
    data: Record<string, unknown>
): Promise<{ success: boolean; queued: boolean; error?: string }> {
    if (!navigator.onLine) {
        await queueReport(data);
        return { success: true, queued: true };
    }

    try {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { error } = await supabase.from("field_reports").insert(data);
        if (error) throw error;
        return { success: true, queued: false };
    } catch (err) {
        // Network error — queue for later
        await queueReport(data);
        return { success: true, queued: true };
    }
}
