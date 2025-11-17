import { NextResponse } from 'next/server';
import { createClient } from '@eptss/data-access/utils/supabase/server';
import { ensureUserExists } from '@eptss/auth/server';
import { TOAST_REDIRECT_KEY } from '@eptss/shared';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // Ensure user exists in database and validate referral code for new users
      const ensureUserResult = await ensureUserExists(data.user);

      if (!ensureUserResult.success) {
        // Referral validation failed - redirect with error message
        const errorUrl = new URL('/', origin);
        errorUrl.searchParams.set(TOAST_REDIRECT_KEY, ensureUserResult.error || 'Account creation failed');
        return NextResponse.redirect(errorUrl.toString());
      }

      // User validated successfully, proceed with redirect
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
