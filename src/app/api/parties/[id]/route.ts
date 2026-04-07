import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAuth, requireRole, MANAGER_ROLES } from "@/utils/supabase/api-auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { auth, response } = await requireAuth(req);
    if (!auth) return response;
    const roleError = requireRole(auth, MANAGER_ROLES);
    if (roleError) return roleError;

    try {
        const { id } = await params;
        const body = await req.json();
        const allowed = ["name", "short_name", "hex_color", "color", "coalition", "description", "founded_year"];
        const updates: Record<string, unknown> = {};
        for (const key of allowed) {
            if (key in body) updates[key] = body[key];
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("political_parties")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        try { await (supabase as any).from("audit_logs").insert({ action: "update", module: "parties", record_id: id, details: updates, result: "success" }); } catch {}
        return NextResponse.json({ party: data });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { auth, response } = await requireAuth(req);
    if (!auth) return response;
    const roleError = requireRole(auth, MANAGER_ROLES);
    if (roleError) return roleError;

    try {
        const { id } = await params;
        const supabase = createAdminClient();
        const { error } = await supabase.from("political_parties").delete().eq("id", id);
        if (error) throw error;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        try { await (supabase as any).from("audit_logs").insert({ action: "delete", module: "parties", record_id: id, result: "success" }); } catch {}
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
