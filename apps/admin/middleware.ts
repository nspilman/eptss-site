import { createAuthMiddleware } from '@eptss/auth/middleware'

export const middleware = createAuthMiddleware({
  protectedPaths: ['/admin'],
  publicPaths: ['/login'],
  redirectToOnAuth: '/admin',
  redirectToOnNoAuth: '/login',
  adminPaths: ['/admin'],
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}