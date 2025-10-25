import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { response, user } = await updateSession(request);

    // If authenticated and on root, redirect to dashboard server-side
    if (user && request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        const redirectResponse = NextResponse.redirect(url);
        // Preserve cookies set during session update
        const cookiesToCopy = response.cookies.getAll();
        for (const cookie of cookiesToCopy) {
            // Copy by name/value to avoid type mismatches across Next versions
            redirectResponse.cookies.set(cookie.name, cookie.value);
        }
        return redirectResponse;
    }

    // Redirect /round/current to the current round's slug
    if (request.nextUrl.pathname === '/round/current') {
        try {
            const apiUrl = new URL('/api/round/current', request.nextUrl.origin);
            const apiRes = await fetch(apiUrl.toString(), {
                headers: { 'accept': 'application/json' },
                // Ensure middleware request context is forwarded when possible
                cache: 'no-store',
            });
            if (apiRes.ok) {
                const data = await apiRes.json();
                const slug = data?.slug;
                if (slug) {
                    const url = request.nextUrl.clone();
                    url.pathname = `/round/${slug}`;
                    const redirectResponse = NextResponse.redirect(url);
                    const cookiesToCopy = response.cookies.getAll();
                    for (const cookie of cookiesToCopy) {
                        redirectResponse.cookies.set(cookie.name, cookie.value);
                    }
                    return redirectResponse;
                }
            }
        } catch (e) {
            // Fall through to default response if any error occurs
        }
    }

    return response;
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
  runtime: 'nodejs',
}
