import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { TOAST_REDIRECT_KEY } from "@/constants";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;

  const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${redirectTo.pathname}`;

  try {
    if (token_hash && type) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.delete({ name, ...options });
            },
          },
        }
      );

      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      Sentry.captureMessage(redirectUrl);

      if (!error) {
        return NextResponse.redirect(redirectUrl);
      }
    }
    if (code) {
      const cookieStore = cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.delete({ name, ...options });
            },
          },
        }
      );
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  } catch (e) {
    // return the user to an error page with some instructions
    return NextResponse.redirect(
      redirectUrl + `/?${TOAST_REDIRECT_KEY}=${(e as Error).message}`
    );
  }
  Sentry.captureException("Login error occurred - no exception thrown");
  return NextResponse.redirect(
    redirectUrl + `/?${TOAST_REDIRECT_KEY}="An error has occured"`
  );
}


