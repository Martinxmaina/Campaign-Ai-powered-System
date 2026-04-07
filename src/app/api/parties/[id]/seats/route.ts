import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: partyId } = await params;
        const body = await req.json();

        const { candidate_name, seat_type, level, constituency, county, ward, vote_count, vote_share, status } = body;
        if (!candidate_name || !seat_type) return NextResponse.json({ error: "candidate_name and seat_type required" }, { status: 400 });

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("political_seats")
            .insert({
                candidate_name,
                seat_type,
                level: level ?? "constituency",
                constituency: constituency ?? null,
                county: county ?? "Nyandarua",
                ward: ward ?? null,
                party_id: partyId,
                vote_count: vote_count ?? 0,
                vote_share: vote_share ?? 0,
                status: status ?? "declared",
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ seat: data });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("political_seats")
            .select("*")
            .eq("party_id", id)
            .order("vote_share", { ascending: false });
        if (error) throw error;
        return NextResponse.json({ seats: data });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
