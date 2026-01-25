import { NextResponse } from 'next/server';
import { createClient } from '@eptss/core/utils/supabase/server';
import { ensureUserExists } from '@eptss/auth/server';
import { validateGoogleOAuthUser } from '@eptss/actions';
import { TOAST_REDIRECT_KEY } from '@eptss/shared';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // Validate referral code for new users BEFORE creating user in database
      const validationResult = await validateGoogleOAuthUser(data.user.email || '');

      if (!validationResult.success) {
        // Referral validation failed - delete the auth user and redirect with error
        // Note: Supabase already created the auth user during exchangeCodeForSession
        // We need to clean it up since validation failed
        try {
          await supabase.auth.admin.deleteUser(data.user.id);
        } catch (deleteError) {
          console.error('Failed to delete auth user after validation failure:', deleteError);
        }

        const errorUrl = new URL('/', origin);
        errorUrl.searchParams.set(TOAST_REDIRECT_KEY, validationResult.error || 'Account creation failed');
        return NextResponse.redirect(errorUrl.toString());
      }

      // Validation passed - ensure user exists in database
      const ensureUserResult = await ensureUserExists(data.user);

      if (!ensureUserResult.success) {
        // Database creation failed - redirect with error message
        const errorUrl = new URL('/', origin);
        errorUrl.searchParams.set(TOAST_REDIRECT_KEY, ensureUserResult.error || 'Account creation failed');
        return NextResponse.redirect(errorUrl.toString());
      }

      // User validated and created successfully, proceed with redirect
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
