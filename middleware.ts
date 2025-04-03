import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Remove JSON parsing since it might be consuming the body
    const { response } = await updateSession(request);
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
    '/((?!_next/static|_next/image|favicon.ico|auth|verify-signup|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}