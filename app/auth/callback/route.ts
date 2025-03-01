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
  
  // If next is a full URL, use it as is, otherwise prepend the base URL
  const redirectUrl = next?.startsWith('http') 
    ? next 
    : `${process.env.NEXT_PUBLIC_BASE_URL}${next ?? '/'}`;

  try {
    if (token_hash && type) {
      const supabase = await createClient();

      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      Sentry.captureMessage(redirectUrl);

      if (!error) {
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch (e) {
    // return the user to an error page with some instructions
    return NextResponse.redirect(
      redirectUrl + `?${TOAST_REDIRECT_KEY}=${(e as Error).message}`
    );
  }
  Sentry.captureException(
    "Login error occurred - no exception thrown. url:" + request.url
  );
  return NextResponse.redirect(
    redirectUrl + `?${TOAST_REDIRECT_KEY}="An error has occured"`
  );
}
