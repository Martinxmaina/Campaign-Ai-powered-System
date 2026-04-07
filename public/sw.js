// VoterCore Field — Service Worker v5
// Cache-first for app shell, network-first for API, full offline support

const CACHE_VERSION = "votercore-field-v5";
const APP_SHELL = [
    "/field",
    "/field/report",
    "/field/login",
    "/field/history",
    "/research/intel-form",
    "/manifest.json",
    "/favicon.ico",
];
const OFFLINE_BOOTSTRAP_KEY = "votercore-bootstrap";

// ── Install: cache app shell ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            return cache.addAll(APP_SHELL).catch(() => {
                // If any shell page fails to cache, still install
            });
        })
    );
    self.skipWaiting();
});

// ── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k !== CACHE_VERSION)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ── Offline Queues (IndexedDB) ───────────────────────────────────────────────
const INTEL_DB = "votercore-offline";
const INTEL_STORE = "pending_intel";
const SURVEY_STORE = "pending_surveys";

function openIntelDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(INTEL_DB, 2);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(INTEL_STORE)) {
                db.createObjectStore(INTEL_STORE, { autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(SURVEY_STORE)) {
                db.createObjectStore(SURVEY_STORE, { autoIncrement: true });
            }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

async function queueIntelReport(body) {
    const db = await openIntelDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(INTEL_STORE, "readwrite");
        tx.objectStore(INTEL_STORE).add({ body, timestamp: Date.now() });
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

async function flushIntelQueue() {
    const db = await openIntelDB();
    const tx = db.transaction(INTEL_STORE, "readwrite");
    const store = tx.objectStore(INTEL_STORE);
    const allReq = store.getAll();
    const keysReq = store.getAllKeys();

    await new Promise((resolve, reject) => {
        allReq.onsuccess = () => {};
        keysReq.onsuccess = () => {};
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });

    const items = allReq.result ?? [];
    const keys = keysReq.result ?? [];

    for (let i = 0; i < items.length; i++) {
        try {
            const res = await fetch("/api/research-intel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(items[i].body),
            });
            if (res.ok) {
                // Remove from queue
                const delTx = db.transaction(INTEL_STORE, "readwrite");
                delTx.objectStore(INTEL_STORE).delete(keys[i]);
                await new Promise((r) => (delTx.oncomplete = r));
            }
        } catch { /* Will retry next sync */ }
    }

    // Notify clients about sync completion
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((c) => c.postMessage({ type: "INTEL_SYNC_DONE" }));
}

async function queueSurveyResponse(surveyId, payload) {
    const db = await openIntelDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(SURVEY_STORE, "readwrite");
        tx.objectStore(SURVEY_STORE).add({ surveyId, payload, timestamp: Date.now() });
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

async function flushSurveyQueue() {
    const db = await openIntelDB();
    const tx = db.transaction(SURVEY_STORE, "readwrite");
    const store = tx.objectStore(SURVEY_STORE);
    const allReq = store.getAll();
    const keysReq = store.getAllKeys();

    await new Promise((resolve, reject) => {
        allReq.onsuccess = () => {};
        keysReq.onsuccess = () => {};
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });

    const items = allReq.result ?? [];
    const keys = keysReq.result ?? [];

    for (let i = 0; i < items.length; i++) {
        try {
            const { surveyId, payload } = items[i];
            const res = await fetch(`/api/surveys/${surveyId}/responses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const delTx = db.transaction(SURVEY_STORE, "readwrite");
                delTx.objectStore(SURVEY_STORE).delete(keys[i]);
                await new Promise((r) => (delTx.oncomplete = r));
            }
        } catch { /* retry next sync */ }
    }
}

// ── Fetch strategy ───────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Intercept POST to /api/surveys/[id]/responses for offline queuing
    const surveyResponseMatch = url.pathname.match(/^\/api\/surveys\/([^/]+)\/responses$/);
    if (event.request.method === "POST" && surveyResponseMatch) {
        const surveyId = surveyResponseMatch[1];
        event.respondWith(
            event.request.json().then(async (payload) => {
                try {
                    const res = await fetch(`/api/surveys/${surveyId}/responses`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                    return res;
                } catch {
                    await queueSurveyResponse(surveyId, payload);
                    return new Response(JSON.stringify({ queued: true, offline: true }), {
                        status: 202,
                        headers: { "Content-Type": "application/json" },
                    });
                }
            })
        );
        return;
    }

    // Intercept POST to /api/research-intel for offline queuing
    if (event.request.method === "POST" && url.pathname === "/api/research-intel") {
        event.respondWith(
            event.request.json().then(async (body) => {
                try {
                    const res = await fetch("/api/research-intel", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    });
                    return res;
                } catch {
                    // Offline — queue for later
                    await queueIntelReport(body);
                    return new Response(JSON.stringify({ queued: true, offline: true }), {
                        status: 202,
                        headers: { "Content-Type": "application/json" },
                    });
                }
            })
        );
        return;
    }

    // Skip other non-GET requests
    if (event.request.method !== "GET") return;

    // Network-first for Supabase API (allow cross-origin)
    if (url.hostname.includes("supabase.co")) {
        event.respondWith(
            fetch(event.request)
                .then((res) => {
                    // Cache successful bootstrap/candidates responses
                    if (res.ok && (url.pathname.includes("/rest/v1/candidates") || url.pathname.includes("/rest/v1/field_reports"))) {
                        const clone = res.clone();
                        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
                    }
                    return res;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Skip other cross-origin
    if (url.origin !== self.location.origin) return;

    // Network-first for our API routes
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(
            fetch(event.request)
                .then((res) => {
                    if (res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
                    }
                    return res;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for app shell + static assets
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((res) => {
                if (res.ok) {
                    const clone = res.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
                }
                return res;
            }).catch(() => {
                // Return offline page for navigation requests
                if (event.request.destination === "document") {
                    // Survey pages get a cached version if available, else field fallback
                    if (url.pathname.startsWith("/survey/")) {
                        return caches.match(url.pathname) || new Response("Offline — survey will load when connected", { status: 503 });
                    }
                    return caches.match("/field") || new Response("Offline", { status: 503 });
                }
                return new Response("", { status: 503 });
            });
        })
    );
});

// ── Background Sync ──────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
    if (event.tag === "sync-field-reports") {
        event.waitUntil(notifyClientsToSync());
    }
    if (event.tag === "sync-intel-reports") {
        event.waitUntil(flushIntelQueue());
    }
    if (event.tag === "sync-survey-responses") {
        event.waitUntil(flushSurveyQueue());
    }
});

async function notifyClientsToSync() {
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
    clients.forEach((client) => client.postMessage({ type: "SYNC_FIELD_REPORTS" }));
}

// ── Push Notifications (War Room alerts) ────────────────────────────────────
self.addEventListener("push", (event) => {
    const data = event.data?.json() ?? {};
    event.waitUntil(
        self.registration.showNotification(data.title ?? "VoterCore Alert", {
            body: data.body ?? "",
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: data.tag ?? "votercore",
            data: { url: data.url ?? "/field" },
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: "window" }).then((clients) => {
            const url = event.notification.data?.url ?? "/field";
            const existing = clients.find((c) => c.url.includes(url));
            if (existing) return existing.focus();
            return self.clients.openWindow(url);
        })
    );
});
