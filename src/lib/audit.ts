// Audit logging helper — call from API routes to record user actions
// Never import in client components

import { createAdminClient } from "@/utils/supabase/admin";
import { NextRequest } from "next/server";

export interface AuditEntry {
    user_id?: string | null;
    user_email?: string | null;
    role?: string | null;
    action: string;      // create / update / delete / view / export / login / logout
    module: string;      // candidates / war-room / finance / field / admin / parties
    record_id?: string;
    details?: Record<string, unknown>;
    result?: "success" | "error";
}

export async function logAction(entry: AuditEntry, req?: NextRequest): Promise<void> {
    try {
        const supabase = createAdminClient();
        const ip = req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            ?? req?.headers.get("x-real-ip")
            ?? null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("audit_logs") as any).insert({
            user_id:    entry.user_id ?? null,
            user_email: entry.user_email ?? null,
            role:       entry.role ?? null,
            action:     entry.action,
            module:     entry.module,
            record_id:  entry.record_id ?? null,
            details:    entry.details ? JSON.parse(JSON.stringify(entry.details)) : null,
            ip_address: ip,
            result:     entry.result ?? "success",
        });
    } catch {
        // Audit failures must never break the main request
    }
}

// Helper to extract user info from a Supabase user object
export function userAuditInfo(user: { id: string; email?: string; user_metadata?: { role?: string } } | null) {
    if (!user) return { user_id: null, user_email: null, role: null };
    return {
        user_id:    user.id,
        user_email: user.email ?? null,
        role:       user.user_metadata?.role ?? null,
    };
}
