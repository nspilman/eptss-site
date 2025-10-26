import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

interface AuthMiddlewareConfig {
  protectedPaths?: string[];
  publicPaths?: string[];
  redirectToOnAuth?: string;
  redirectToOnNoAuth?: string;
  adminPaths?: string[];
}

export function createAuthMiddleware(config: AuthMiddlewareConfig = {}) {
  const {
    protectedPaths = ['/dashboard', '/profile', '/submit', '/voting', '/admin'],
    publicPaths = ['/login', '/sign-up'],
    redirectToOnAuth = '/dashboard',
    redirectToOnNoAuth = '/login',
    adminPaths = ['/admin'],
  } = config;

  return async function middleware(request: NextRequest) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname;

    // Check if path is admin route
    const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
    if (isAdminPath && user) {
      // Check if user is admin
      const email = user.email;
      const isAdmin = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.NODE_ENV === "development";
      
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // If authenticated and on root, redirect to dashboard
    if (user && pathname === '/') {
      return NextResponse.redirect(new URL(redirectToOnAuth, request.url))
    }

    // Protected routes - redirect to login if not authenticated
    const isProtected = protectedPaths.some(path => pathname.startsWith(path))
    
    if (!user && isProtected) {
      const redirectUrl = new URL(redirectToOnNoAuth, request.url)
      redirectUrl.searchParams.set('redirectUrl', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Public routes - redirect to dashboard if authenticated
    const isPublic = publicPaths.some(path => pathname.startsWith(path))
    if (user && isPublic) {
      return NextResponse.redirect(new URL(redirectToOnAuth, request.url))
    }

    return response
  }
}