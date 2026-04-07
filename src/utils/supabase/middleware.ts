import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Redirect unauthenticated users to login.
    // API routes manage their own Bearer-token auth — the cookie-based redirect
    // does not apply to them (n8n and other server callers have no cookies).
    // Public non-API pages: /login, /auth, /field, /survey (anonymous survey respondents).
    const pathname = request.nextUrl.pathname
    const isPublicRoute =
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/field') ||
        pathname.startsWith('/survey') ||
        pathname.startsWith('/api')  // API routes self-guard via requireAuth()

    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from login
    if (user && pathname.startsWith('/login')) {
        const role = user.user_metadata?.role ?? 'campaign-manager'
        const homeMap: Record<string, string> = {
            'super-admin': '/admin/overview',
            'campaign-manager': '/dashboard',
            research: '/research',
            comms: '/comms',
            finance: '/finance',
            'call-center': '/call-center',
            media: '/media',
        }
        const url = request.nextUrl.clone()
        url.pathname = homeMap[role] ?? '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
