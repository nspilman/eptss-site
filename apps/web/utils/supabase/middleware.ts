import { AUTH_HEADER_KEYS } from '@/constants'
import { Navigation, protectedRoutes } from '@/enum/navigation'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ensureUserExists } from './userManagement'

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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Ensure the user exists in our database
    const isAuthCallback = request.nextUrl.pathname.includes('/auth/callback');
    const isDashboard = request.nextUrl.pathname.includes('/dashboard');
    
    // Only try to create the user if we&apos;re coming from an auth callback or if it&apos;s the first request after login
    if (isAuthCallback || isDashboard || request.cookies.get('just_authenticated')) {
      console.log('Middleware: Ensuring user exists in database');
      const result = await ensureUserExists(user);
      
      if (result.success) {
        // If we just created the user, set a cookie to avoid trying again on every request
        if (isAuthCallback) {
          supabaseResponse.cookies.set('just_authenticated', 'true', {
            path: '/',
            maxAge: 10, // Only keep this for a few seconds to handle the initial redirect
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
          });
        }
      } else {
        console.error('Middleware: Failed to ensure user exists:', result.error);
      }
    }
    
    // Set auth cookies
    supabaseResponse.cookies.set(AUTH_HEADER_KEYS.USER_ID, user.id, {
      path: '/', 
      httpOnly: true, 
      secure: true, 
      sameSite: 'strict'
    });

    supabaseResponse.cookies.set(AUTH_HEADER_KEYS.EMAIL, user.email || "", {
      path: '/', 
      httpOnly: true, 
      secure: true, 
      sameSite: 'strict'
    });
    // supabaseResponse.headers.set(AUTH_HEADER_KEYS.USER_ID, user.id)
    // supabaseResponse.headers.set(AUTH_HEADER_KEYS.EMAIL, user.email || "")
    // Add any other user data you need
  }
  else{
    for (let index = 0; index < protectedRoutes.length; index++) {
      const route = protectedRoutes[index];
      if(request.nextUrl.pathname.startsWith(route)){
        const url = request.nextUrl.clone()
        url.pathname = Navigation.Login;
        url.searchParams.append("redirectUrl",route)
        return {response: NextResponse.redirect(url)}
      }
    }
  }

  // if (
  //   !user &&
  //   !request.nextUrl.pathname.startsWith('/login') &&
  //   !request.nextUrl.pathname.startsWith('/auth')
  // ) {
  //   // no user, potentially respond by redirecting the user to the login page
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   return NextResponse.redirect(url)
  // }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return { supabase, response: supabaseResponse, user }
}