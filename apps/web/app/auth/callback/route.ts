import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { TOAST_REDIRECT_KEY } from "@eptss/shared";
import { createClient } from "@eptss/data-access/utils/supabase/server";
import { ensureUserExists } from "@eptss/auth/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");
  
  // Clean the target URL of any auth parameters
  const targetUrl = new URL(next ?? '/', process.env.NEXT_PUBLIC_BASE_URL);
  
  try {
    if (token_hash && type) {
      const supabase = await createClient();

      const { error, data } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      if (!error && data?.user) {
        // Ensure user exists in database
        await ensureUserExists(data.user);
        
        // Add a parameter to indicate successful authentication
        // This will be used by the AuthStateListener to trigger a refresh
        targetUrl.searchParams.set('auth_success', 'true');
        
        // Set cookies for immediate auth state recognition
        const response = NextResponse.redirect(targetUrl.toString());
        
        // Ensure cookies are properly set before redirecting
        if (data?.session) {
          // Wait a moment to ensure auth state is properly established
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return response;
      }
    }
  } catch (e) {
    // return the user to an error page with some instructions
    targetUrl.searchParams.set(TOAST_REDIRECT_KEY, (e as Error).message);
    return NextResponse.redirect(targetUrl.toString());
  }
  
  Sentry.captureException(
    "Login error occurred - no exception thrown. url:" + request.url
  );
  targetUrl.searchParams.set(TOAST_REDIRECT_KEY, "An error has occurred");
  return NextResponse.redirect(targetUrl.toString());
}
