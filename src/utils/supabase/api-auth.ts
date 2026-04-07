import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "./admin";

export type AuthResult =
    | { ok: true; userId: string; role: string; isInternal: false }
    | { ok: true; userId: null; role: null; isInternal: true }
    | { ok: false };

/**
 * Verify an incoming API request.
 * Accepts either:
 *   - `Authorization: Bearer <supabase-access-token>` (user sessions from the dashboard)
 *   - `X-Internal-Key: <INTERNAL_API_SECRET>` (server-to-server calls from n8n / cron)
 *
 * Returns { auth, response: null } on success, or { auth: null, response } to return immediately.
 */
export async function requireAuth(
    req: NextRequest
): Promise<{ auth: AuthResult; response: null } | { auth: null; response: NextResponse }> {
    // Internal secret — for n8n automation nodes and cron triggers
    const internalKey = req.headers.get("X-Internal-Key");
    const secret = process.env.INTERNAL_API_SECRET;
    if (secret && internalKey === secret) {
        return { auth: { ok: true, userId: null, role: null, isInternal: true }, response: null };
    }

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return { auth: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const supabase = createAdminClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return { auth: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const role = (user.user_metadata?.role as string) ?? "campaign-manager";
    return { auth: { ok: true, userId: user.id, role, isInternal: false }, response: null };
}

/** Return a 403 Forbidden response. */
export function forbidden(message = "Forbidden") {
    return NextResponse.json({ error: message }, { status: 403 });
}

const ADMIN_ROLES = ["super-admin"];
const MANAGER_ROLES = ["super-admin", "campaign-manager"];

export function requireRole(auth: AuthResult, roles: string[]): NextResponse | null {
    if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.isInternal) return null; // internal calls bypass role checks
    if (!roles.includes(auth.role)) return forbidden(`Requires one of: ${roles.join(", ")}`);
    return null;
}

export { ADMIN_ROLES, MANAGER_ROLES };
