"use server";

import { db } from "../db";
import { unverifiedSignups } from "../db/schema";
import { eq } from "drizzle-orm";
import { AsyncResult, createSuccessResult, createEmptyResult, createErrorResult } from '../types/asyncResult';

export type UnverifiedSignup = {
  id: number;
  email: string;
  roundId: number;
  songTitle: string;
  artist: string;
  youtubeLink: string;
  additionalComments: string | null;
  createdAt: Date | null;
};

/**
 * Get unverified signup by email
 * @param email - User's email address
 * @returns AsyncResult containing the unverified signup or empty if none found
 */
export async function getUnverifiedSignupByEmail(
  email: string
): Promise<AsyncResult<UnverifiedSignup>> {
  try {
    if (!email || typeof email !== 'string') {
      return createErrorResult(new Error('Invalid email provided'));
    }

    const unverifiedSignup = await db
      .select()
      .from(unverifiedSignups)
      .where(eq(unverifiedSignups.email, email))
      .limit(1);

    if (!unverifiedSignup || unverifiedSignup.length === 0) {
      return createEmptyResult('No unverified signup found for this email');
    }

    return createSuccessResult(unverifiedSignup[0] as UnverifiedSignup);
  } catch (error) {
    return createErrorResult(
      error instanceof Error ? error : new Error('Failed to get unverified signup')
    );
  }
}

/**
 * Check if a user has any pending unverified signups
 * @param email - User's email address
 * @returns AsyncResult<boolean> - true if user has unverified signups
 */
export async function hasUnverifiedSignups(email: string): Promise<AsyncResult<boolean>> {
  try {
    const result = await getUnverifiedSignupByEmail(email);
    return createSuccessResult(result.status === 'success');
  } catch (error) {
    return createErrorResult(
      error instanceof Error ? error : new Error('Failed to check verification status')
    );
  }
}
