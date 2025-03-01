import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { TOAST_REDIRECT_KEY } from "@/constants";
import { createClient } from "@/utils/supabase/server";

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

      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      if (!error) {
        return NextResponse.redirect(targetUrl.toString());
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
