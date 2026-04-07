import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { roleLabels, type CurrentUserRole } from "@/lib/roles";
import { logAction } from "@/lib/audit";

async function verifySuperAdmin(req: NextRequest) {
    const supabase = createAdminClient();
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return null;
    const role = user.user_metadata?.role;
    // Treat unset role as super-admin (initial accounts created in Supabase Dashboard
    // have no role in metadata; RoleContext already defaults them to super-admin).
    if (role && role !== "super-admin") return null;
    return user;
}

// GET /api/admin/users — list all users (super-admin only)
export async function GET(req: NextRequest) {
    try {
        const caller = await verifySuperAdmin(req);
        if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const supabase = createAdminClient();

        const { data: { users }, error } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 100,
        });

        if (error) throw error;

        const formatted = users.map((u) => ({
            id: u.id,
            email: u.email ?? "",
            full_name: u.user_metadata?.full_name ?? "",
            role: (u.user_metadata?.role as CurrentUserRole) ?? "campaign-manager",
            role_label: roleLabels[(u.user_metadata?.role as CurrentUserRole) ?? "campaign-manager"] ?? u.user_metadata?.role,
            created_at: u.created_at,
            last_sign_in: u.last_sign_in_at,
        }));

        return NextResponse.json({ users: formatted });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// POST /api/admin/users — invite a new user
export async function POST(req: NextRequest) {
    try {
        const caller = await verifySuperAdmin(req);
        if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { email, full_name, role } = await req.json();
        if (!email || !role) return NextResponse.json({ error: "email and role required" }, { status: 400 });

        const supabase = createAdminClient();
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: { role, full_name: full_name ?? "" },
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
        });

        if (error) throw error;

        await logAction({ action: "create", module: "users", record_id: email, details: { role } }, req);
        return NextResponse.json({ user: data.user });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// PATCH /api/admin/users — update a user's role
export async function PATCH(req: NextRequest) {
    try {
        const caller = await verifySuperAdmin(req);
        if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { userId, role } = await req.json();
        if (!userId || !role) return NextResponse.json({ error: "userId and role required" }, { status: 400 });

        const supabase = createAdminClient();
        const { data, error } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { role },
        });

        if (error) throw error;

        await logAction({ action: "update", module: "users", record_id: userId, details: { role } }, req);
        return NextResponse.json({ user: data.user });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// DELETE /api/admin/users — deactivate (delete) a user
export async function DELETE(req: NextRequest) {
    try {
        const caller = await verifySuperAdmin(req);
        if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { userId } = await req.json();
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

        const supabase = createAdminClient();
        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) throw error;

        await logAction({ action: "delete", module: "users", record_id: userId }, req);
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
