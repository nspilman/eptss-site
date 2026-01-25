"use server";

import { createClient } from "@eptss/core/utils/supabase/server";
import { logger } from "@eptss/logger/server";
import { db, unverifiedSignups, users } from "@eptss/db";
import { validateReferralCode } from "@eptss/referrals/services";
import { eq, sql } from "drizzle-orm";

/**
 * Server Action: Sign in with OTP (Magic Link)
 * Enforces referral code requirement for new users
 *
 * @param email - User's email address
 * @param redirectUrl - URL to redirect to after authentication
 * @param referralCode - Optional referral code for new users
 * @returns Success/error response with appropriate message
 */
export async function signInWithOTPAction({
  email,
  redirectUrl,
  referralCode,
}: {
  email: string;
  redirectUrl?: string;
  referralCode?: string;
}) {
  logger.action('signInWithOTP', 'started', { email });

  try {
    const supabase = await createClient();

    // Check if user already exists in the database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim()))
      .limit(1);

    // If user doesn't exist, we need to validate they have a referral code
    if (existingUser.length === 0) {
      logger.info('Checking referral for new user', { email });

      // If a referral code was provided in the request, validate it
      if (referralCode) {
        const referralValidation = await validateReferralCode(referralCode);
        if (!referralValidation.valid) {
          logger.action('signInWithOTP', 'failed', {
            email,
            message: referralValidation.message
          });
          return {
            error: {
              message: referralValidation.message
            }
          };
        }
        logger.info('Referral code validated for new user', { email });
      } else {
        // No referral code provided - check if they have an unverified signup
        const unverifiedSignup = await db
          .select()
          .from(unverifiedSignups)
          .where(eq(unverifiedSignups.email, email.trim()))
          .limit(1);

        if (unverifiedSignup.length === 0) {
          logger.info('Blocked sign in - no referral code', { email });
          return {
            error: {
              message: 'Account creation requires a referral code. Please sign up with a valid referral link.'
            }
          };
        }

        // Validate the referral code from the unverified signup
        const storedReferralCode = unverifiedSignup[0].referralCode;
        if (!storedReferralCode) {
          logger.action('signInWithOTP', 'failed', { email, message: 'Missing referral code' });
          return {
            error: {
              message: 'Account creation requires a referral code. Please sign up with a valid referral link.'
            }
          };
        }

        const referralValidation = await validateReferralCode(storedReferralCode);
        if (!referralValidation.valid) {
          logger.action('signInWithOTP', 'failed', { email, message: referralValidation.message });
          return {
            error: {
              message: referralValidation.message
            }
          };
        }
        logger.info('Referral code from unverified signup validated', { email });
      }
    }

    // User exists OR has valid referral code - proceed with OTP
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectUrl ?? "/",
      },
    });

    if (error) {
      logger.action('signInWithOTP', 'failed', { email, error });
      return { error };
    }

    logger.action('signInWithOTP', 'completed', { email });
    return { error: null };
  } catch (error) {
    logger.action('signInWithOTP', 'failed', {
      email,
      error: error instanceof Error ? error : undefined
    });
    return {
      error: {
        message: 'An unexpected error occurred. Please try again.'
      }
    };
  }
}

/**
 * Server Action: Validate Google OAuth user has referral code
 * Called from Google OAuth callback to ensure new users have valid referral codes
 *
 * @param userEmail - Email from OAuth user data
 * @returns Success/error response
 */
export async function validateGoogleOAuthUser(userEmail: string) {
  logger.action('validateGoogleOAuthUser', 'started', { email: userEmail });

  try {
    // Check if user already exists in the database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail.trim()))
      .limit(1);

    // If user exists, they're good to go
    if (existingUser.length > 0) {
      logger.info('Existing user allowed', { email: userEmail });
      logger.action('validateGoogleOAuthUser', 'completed', { email: userEmail });
      return { success: true };
    }

    // New user - check for referral code
    logger.info('Checking referral for new user', { email: userEmail });

    const unverifiedSignup = await db
      .select()
      .from(unverifiedSignups)
      .where(eq(unverifiedSignups.email, userEmail.trim()))
      .limit(1);

    if (unverifiedSignup.length === 0) {
      logger.info('Blocked - no referral code', { email: userEmail });
      logger.action('validateGoogleOAuthUser', 'failed', { email: userEmail });
      return {
        success: false,
        error: 'Account creation requires a referral code. Please sign up with a valid referral link.'
      };
    }

    // Validate the referral code
    const referralCode = unverifiedSignup[0].referralCode;
    if (!referralCode) {
      logger.info('Blocked - missing referral code', { email: userEmail });
      logger.action('validateGoogleOAuthUser', 'failed', { email: userEmail });
      return {
        success: false,
        error: 'Account creation requires a referral code. Please sign up with a valid referral link.'
      };
    }

    const referralValidation = await validateReferralCode(referralCode);
    if (!referralValidation.valid) {
      logger.info('Blocked - invalid referral code', {
        email: userEmail,
        message: referralValidation.message
      });
      logger.action('validateGoogleOAuthUser', 'failed', { email: userEmail });
      return {
        success: false,
        error: referralValidation.message
      };
    }

    logger.info('Referral validated - user allowed', { email: userEmail });
    logger.action('validateGoogleOAuthUser', 'completed', { email: userEmail });
    return { success: true };
  } catch (error) {
    logger.action('validateGoogleOAuthUser', 'failed', {
      email: userEmail,
      error: error instanceof Error ? error : undefined
    });
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Server Action: Sign out the current user
 */
export async function signout() {
  logger.action('signout', 'started');

  try {
    const supabase = await createClient();
    const result = await supabase.auth.signOut();
    logger.action('signout', 'completed');
    return result;
  } catch (error) {
    logger.action('signout', 'failed', {
      error: error instanceof Error ? error : undefined
    });
    throw error;
  }
}
