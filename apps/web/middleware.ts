import { createAuthMiddleware } from '@eptss/auth/middleware'

export const middleware = createAuthMiddleware({
  protectedPaths: [
    '/dashboard',
    '/submit',
    '/voting',
    '/projects/.*/dashboard',
    '/projects/.*/submit',
    '/projects/.*/voting',
    '/projects/.*/discussions',
    '/projects/.*/reflections',
  ],
  publicPaths: ['/login', '/sign-up'],
  redirectToOnAuth: '/dashboard',
  redirectToOnNoAuth: '/login',
})

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
