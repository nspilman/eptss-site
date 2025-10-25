import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
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
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session
    const { data: { user } } = await supabase.auth.getUser()

    // If authenticated and on root, redirect to dashboard
    if (user && request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // Protected routes - redirect to login if not authenticated
    const protectedPaths = ['/dashboard', '/profile', '/submit', '/voting']
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
    
    if (!user && isProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectUrl', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication routes)
     * - verify-signup (signup verification page)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|eptss-logo.png|auth|verify-signup|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
