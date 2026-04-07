import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// POST /api/notifications — create a notification (internal use)
export async function POST(req: NextRequest) {
    try {
        const { title, body, type, link, user_id } = await req.json();
        if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("notifications")
            .insert({
                title,
                body: body ?? null,
                type: type ?? "info",
                link: link ?? null,
                user_id: user_id ?? null,
                read: false,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ notification: data });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// GET /api/notifications — list recent notifications (broadcast + user-specific)
export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get("user_id");
        const supabase = createAdminClient();

        let query = supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

        if (userId) {
            query = query.or(`user_id.is.null,user_id.eq.${userId}`) as typeof query;
        } else {
            query = query.is("user_id", null) as typeof query;
        }

        const { data, error } = await query;
        if (error) throw error;
        return NextResponse.json({ notifications: data });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// PATCH /api/notifications — mark as read
export async function PATCH(req: NextRequest) {
    try {
        const { id, all, user_id } = await req.json();
        const supabase = createAdminClient();

        if (all) {
            let query = supabase
                .from("notifications")
                .update({ read: true })
                .eq("read", false);
            if (user_id) {
                query = query.or(`user_id.is.null,user_id.eq.${user_id}`) as typeof query;
            }
            const { error } = await query;
            if (error) throw error;
        } else if (id) {
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("id", id);
            if (error) throw error;
        } else {
            return NextResponse.json({ error: "id or all required" }, { status: 400 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
