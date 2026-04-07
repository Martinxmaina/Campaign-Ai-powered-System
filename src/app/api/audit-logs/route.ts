import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAuth, requireRole, MANAGER_ROLES } from "@/utils/supabase/api-auth";

export async function GET(req: NextRequest) {
  const { auth, response } = await requireAuth(req);
  if (!auth) return response;
  const roleError = requireRole(auth, MANAGER_ROLES);
  if (roleError) return roleError;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;
    const { searchParams } = new URL(req.url);

    const module = searchParams.get("module") || "";
    const action = searchParams.get("action") || "";
    const user   = searchParams.get("user") || "";
    const limit  = Math.min(parseInt(searchParams.get("limit") || "200"), 500);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (module) query = query.eq("module", module);
    if (action) query = query.eq("action", action);
    if (user)   query = query.ilike("user_email", `%${user}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ logs: data ?? [], total: count ?? 0 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
