/**
 * Wraps fetch() to automatically include the Supabase session token
 * as an Authorization: Bearer header. Use this for all client-side
 * calls to protected API routes.
 */
import { createClient } from "./client";

export async function authFetch(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<Response> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const headers = new Headers(init.headers);
    if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    return fetch(input, { ...init, headers });
}
