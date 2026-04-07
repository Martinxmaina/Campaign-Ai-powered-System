import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAuth, requireRole, MANAGER_ROLES } from "@/utils/supabase/api-auth";

const BUCKET = "candidate-photos";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { auth, response } = await requireAuth(req);
    if (!auth) return response;
    const roleError = requireRole(auth, MANAGER_ROLES);
    if (roleError) return roleError;

    try {
        const { id } = await params;
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
        if (!allowed.includes(ext)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });

        const supabase = createAdminClient();
        const path = `${id}/${Date.now()}-photo.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(path, await file.arrayBuffer(), {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

        // Update candidate record with new photo URL
        const { data: candidate, error: updateError } = await supabase
            .from("candidates")
            .update({ photo_url: publicUrl })
            .eq("id", id)
            .select("photo_url, updated_at")
            .single();

        if (updateError) throw updateError;

        return NextResponse.json({ photo_url: candidate?.photo_url ?? publicUrl, updated_at: candidate?.updated_at ?? null });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
