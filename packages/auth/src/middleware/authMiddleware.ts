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
    const pathname = request.nextUrl.pathname;
    
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Check if Supabase env vars are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      // Allow access to public paths if env vars are missing
      const isPublic = publicPaths.some(path => pathname.startsWith(path));
      if (isPublic) {
        return response;
      }
      // Redirect to login for protected paths
      return NextResponse.redirect(new URL(redirectToOnNoAuth, request.url));
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

    // Skip auth logic for public paths when not authenticated
    const isPublic = publicPaths.some(path => pathname.startsWith(path));
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));
    const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

    if (isPublic && !user) {
      return response;
    }

    // Check if path is admin route
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
    if (!user && isProtected) {
      const redirectUrl = new URL(redirectToOnNoAuth, request.url)
      redirectUrl.searchParams.set('redirectUrl', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Public routes - redirect to dashboard if authenticated
    if (user && isPublic) {
      return NextResponse.redirect(new URL(redirectToOnAuth, request.url))
    }

    return response
  }
}