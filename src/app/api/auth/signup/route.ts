import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Uses service role key — admin-only endpoint for creating users with roles
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const { email, password, role, full_name } = await req.json()

        if (!email || !password || !role) {
            return NextResponse.json(
                { error: 'email, password, and role are required' },
                { status: 400 }
            )
        }

        const validRoles = [
            'super-admin', 'campaign-manager', 'research',
            'comms', 'finance', 'call-center', 'media'
        ]
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
                { status: 400 }
            )
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role, full_name: full_name || email.split('@')[0] },
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ user: { id: data.user.id, email: data.user.email, role } })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
