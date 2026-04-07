import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAuth, requireRole, ADMIN_ROLES } from "@/utils/supabase/api-auth";

export async function POST(req: NextRequest) {
    const { auth, response } = await requireAuth(req);
    if (!auth) return response;
    const roleError = requireRole(auth, ADMIN_ROLES);
    if (roleError) return roleError;

    try {
        const { event_name, event_date, description, type, is_primary } = await req.json();
        if (!event_name || !event_date) return NextResponse.json({ error: "event_name and event_date required" }, { status: 400 });

        const supabase = createAdminClient();

        // If setting as primary, unmark others first
        if (is_primary) {
            await supabase.from("election_events").update({ is_primary: false }).eq("is_primary", true);
        }

        const { data, error } = await supabase
            .from("election_events")
            .insert({
                event_name,
                event_date: new Date(event_date).toISOString(),
                description: description ?? null,
                type: type ?? "election",
                is_primary: is_primary ?? false,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ event: data });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const { auth, response } = await requireAuth(req);
    if (!auth) return response;
    const roleError = requireRole(auth, ADMIN_ROLES);
    if (roleError) return roleError;

    try {
        const { id, is_primary, ...rest } = await req.json();
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

        const supabase = createAdminClient();

        if (is_primary) {
            await supabase.from("election_events").update({ is_primary: false }).eq("is_primary", true);
        }

        const updates: Record<string, unknown> = { ...rest };
        if (is_primary !== undefined) updates.is_primary = is_primary;

        const { data, error } = await supabase
            .from("election_events")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ event: data });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { auth, response } = await requireAuth(req);
    if (!auth) return response;
    const roleError = requireRole(auth, ADMIN_ROLES);
    if (roleError) return roleError;

    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

        const supabase = createAdminClient();
        const { error } = await supabase.from("election_events").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
