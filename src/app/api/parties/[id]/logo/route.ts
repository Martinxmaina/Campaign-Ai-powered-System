import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

const BUCKET = "party-logos";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
        const allowed = ["jpg", "jpeg", "png", "webp", "svg"];
        if (!allowed.includes(ext)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });

        const supabase = createAdminClient();
        const path = `${id}/logo.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(path, await file.arrayBuffer(), {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

        const { error: updateError } = await supabase
            .from("political_parties")
            .update({ logo_url: publicUrl })
            .eq("id", id);

        if (updateError) throw updateError;

        return NextResponse.json({ logo_url: publicUrl });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
