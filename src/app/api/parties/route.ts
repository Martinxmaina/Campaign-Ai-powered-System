import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAuth, requireRole, MANAGER_ROLES } from "@/utils/supabase/api-auth";

export async function POST(req: NextRequest) {
    const { auth, response } = await requireAuth(req);
    if (!auth) return response;
    const roleError = requireRole(auth, MANAGER_ROLES);
    if (roleError) return roleError;

    try {
        const { name, short_name, hex_color, coalition, description, founded_year } = await req.json();
        if (!name || !short_name) return NextResponse.json({ error: "name and short_name required" }, { status: 400 });

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("political_parties")
            .insert({ name, short_name, hex_color: hex_color ?? null, coalition: coalition ?? null, description: description ?? null, founded_year: founded_year ?? null })
            .select()
            .single();

        if (error) {
            console.error("POST /api/parties error:", error);
            const status = error.code === "23505" ? 409 : 500;
            const message = error.code === "23505"
                ? `Short name "${short_name}" already exists. Use a unique abbreviation.`
                : error.message;
            return NextResponse.json({ error: message }, { status });
        }
        // Audit log
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        try { await (supabase as any).from("audit_logs").insert({ action: "create", module: "parties", record_id: data.id, details: { name, short_name }, result: "success" }); } catch {}
        return NextResponse.json({ party: data });
    } catch (err) {
        console.error("POST /api/parties exception:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
