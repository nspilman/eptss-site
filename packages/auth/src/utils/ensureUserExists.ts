/**
 * User Management Utilities
 *
 * Ensures user records exist in the database after authentication
 * Enforces referral code requirement for new user creation
 */

import { createClient } from './supabase-server';
import { User } from '@supabase/supabase-js';
import { db } from '@eptss/data-access/db';
import { unverifiedSignups } from '@eptss/data-access/db/schema';
import { validateReferralCode } from '@eptss/data-access/services/referralService';
import { eq } from 'drizzle-orm';

/**
 * Ensures a user record exists in the users table after authentication
 *
 * This function checks if a user exists in the database and creates a new record
 * if they don't exist. It includes retry logic to handle potential race conditions.
 *
 * @param user - The authenticated Supabase user object
 * @returns Object with success status and optional error
 */
export async function ensureUserExists(user: User) {
  try {
    const supabase = await createClient();

    // Check if the user already exists in the users table
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('userid')
      .eq('userid', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
      console.error('Error checking if user exists:', fetchError);
      return { success: false, error: fetchError };
    }

    // If the user doesn't exist, create a new record
    if (!existingUser) {
      // Make sure we have an email
      if (!user.email) {
        console.error('Cannot create user record: Email is missing');
        return { success: false, error: 'Email is missing' };
      }

      console.log('Creating new user record for:', user.email);

      // CHECK FOR REFERRAL CODE REQUIREMENT
      // Query unverifiedSignups table for this email
      const unverifiedSignup = await db
        .select()
        .from(unverifiedSignups)
        .where(eq(unverifiedSignups.email, user.email))
        .limit(1);

      // If no unverified signup found, user didn't go through signup flow with referral code
      if (unverifiedSignup.length === 0) {
        console.error('No unverified signup found for:', user.email);
        return {
          success: false,
          error: 'Account creation requires a referral code. Please sign up with a valid referral link.'
        };
      }

      // Check if referral code exists in the unverified signup
      const referralCode = unverifiedSignup[0].referralCode;
      if (!referralCode) {
        console.error('No referral code found in unverified signup for:', user.email);
        return {
          success: false,
          error: 'Account creation requires a referral code. Please sign up with a valid referral link.'
        };
      }

      // Validate the referral code
      const referralValidation = await validateReferralCode(referralCode);
      if (!referralValidation.valid) {
        console.error('Invalid referral code for:', user.email, referralValidation.message);
        return {
          success: false,
          error: referralValidation.message
        };
      }

      console.log('Referral code validated successfully for:', user.email);

      // Extract username from email (before the @)
      const username = user.email.split('@')[0];

      // Extract display name from user metadata (set during signup)
      const publicDisplayName = user.user_metadata?.name || undefined;

      // Add a retry mechanism for creating the user
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;
      let lastError = null;

      while (!success && retryCount < maxRetries) {
        const { error: insertError } = await (supabase
          .from('users') as any)
          .insert({
            userid: user.id,
            email: user.email,
            username: username,
            public_display_name: publicDisplayName,
          });

        if (insertError) {
          console.error(`Error creating user record (attempt ${retryCount + 1}):`, insertError);
          lastError = insertError;
          retryCount++;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log('Successfully created user record');
          success = true;
          return { success: true };
        }
      }

      if (!success) {
        console.error('Failed to create user record after multiple attempts');
        return { success: false, error: lastError };
      }
    } else {
      console.log('User already exists in database');
      return { success: true };
    }

    return { success: true };
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return { success: false, error };
  }
}
