import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// PATCH /api/account — update own profile (full_name)
export async function PATCH(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabase = createAdminClient();

        // Verify token and get user id
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { full_name } = await req.json();
        if (typeof full_name !== "string" || !full_name.trim()) {
            return NextResponse.json({ error: "full_name is required" }, { status: 400 });
        }

        const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: { ...user.user_metadata, full_name: full_name.trim() },
        });

        if (error) throw error;

        return NextResponse.json({ user: data.user });
    } catch (err) {
        console.error("PATCH /api/account error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
