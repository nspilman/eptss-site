import { db } from '../db';
import { referralCodes, userReferrals, users } from '../db/schema';
import { eq, and, or, sql, gt } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';

// Generate readable referral codes
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 4);

/**
 * Helper to sanitize and format a name for use in referral codes
 * Removes non-alphanumeric characters, converts to lowercase
 */
function sanitizeNameForCode(name: string): string {
  return name
    .trim()
    .split(/\s+/)[0] // Take first word only
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
    .toLowerCase()
    .slice(0, 15); // Max 15 characters
}

/**
 * Generate a unique referral code for a user
 */
export async function createReferralCode(
  userId: string,
  options: {
    maxUses?: number | null;
    expiresAt?: Date | null;
  } = {}
): Promise<{ success: boolean; code?: string; message: string }> {
  try {
    // Check if user exists and get their display name
    const [user] = await db.select().from(users).where(eq(users.userid, userId)).limit(1);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Get user's first name from publicDisplayName or username
    const displayName = user.publicDisplayName || user.username || 'friend';
    const firstName = sanitizeNameForCode(displayName);

    // Generate a unique code with format: happy-2026-from-firstname
    let code = `happy-2026-from-${firstName}`;
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique by adding a random suffix if needed
    while (attempts < maxAttempts) {
      const existing = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.code, code))
        .limit(1);

      if (existing.length === 0) break;

      // Add random suffix if code already exists
      code = `happy-2026-from-${firstName}-${nanoid()}`;
      attempts++;
    }

    if (attempts === maxAttempts) {
      return { success: false, message: 'Failed to generate unique code' };
    }

    // Create the referral code
    await db.insert(referralCodes).values({
      code,
      createdByUserId: userId,
      maxUses: options.maxUses ?? null,
      expiresAt: options.expiresAt ?? null,
    });

    return { success: true, code, message: 'Referral code created successfully' };
  } catch (error) {
    console.error('Error creating referral code:', error);
    return { success: false, message: 'Failed to create referral code' };
  }
}

/**
 * Validate a referral code and check if it can be used
 */
export async function validateReferralCode(
  code: string
): Promise<{ valid: boolean; message: string; referralCodeId?: string }> {
  try {
    const [referralCode] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    if (!referralCode) {
      return { valid: false, message: 'Invalid referral code' };
    }

    if (!referralCode.isActive) {
      return { valid: false, message: 'This referral code is no longer active' };
    }

    if (referralCode.expiresAt && new Date(referralCode.expiresAt) < new Date()) {
      return { valid: false, message: 'This referral code has expired' };
    }

    if (referralCode.maxUses !== null && referralCode.usesCount >= referralCode.maxUses) {
      return { valid: false, message: 'This referral code has reached its maximum uses' };
    }

    return {
      valid: true,
      message: 'Referral code is valid',
      referralCodeId: referralCode.id,
    };
  } catch (error) {
    console.error('Error validating referral code:', error);
    return { valid: false, message: 'Failed to validate referral code' };
  }
}

/**
 * Record a successful referral (called after user creation)
 */
export async function recordReferral(
  referredUserId: string,
  referralCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate the referral code
    const validation = await validateReferralCode(referralCode);
    if (!validation.valid || !validation.referralCodeId) {
      return { success: false, message: validation.message };
    }

    // Get referral code details
    const [refCode] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.id, validation.referralCodeId))
      .limit(1);

    if (!refCode) {
      return { success: false, message: 'Referral code not found' };
    }

    // Create referral record
    await db.insert(userReferrals).values({
      referredUserId,
      referrerUserId: refCode.createdByUserId,
      referralCodeId: validation.referralCodeId,
    });

    // Increment uses count
    await db
      .update(referralCodes)
      .set({
        usesCount: sql`${referralCodes.usesCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(referralCodes.id, validation.referralCodeId));

    return { success: true, message: 'Referral recorded successfully' };
  } catch (error) {
    console.error('Error recording referral:', error);
    return { success: false, message: 'Failed to record referral' };
  }
}

/**
 * Get all referral codes created by a user
 */
export async function getUserReferralCodes(userId: string) {
  try {
    const codes = await db
      .select({
        id: referralCodes.id,
        code: referralCodes.code,
        maxUses: referralCodes.maxUses,
        usesCount: referralCodes.usesCount,
        isActive: referralCodes.isActive,
        expiresAt: referralCodes.expiresAt,
        createdAt: referralCodes.createdAt,
      })
      .from(referralCodes)
      .where(eq(referralCodes.createdByUserId, userId))
      .orderBy(sql`${referralCodes.createdAt} DESC`);

    return { success: true, codes };
  } catch (error) {
    console.error('Error fetching user referral codes:', error);
    return { success: false, codes: [] };
  }
}

/**
 * Get all users referred by a user
 */
export async function getUserReferrals(userId: string) {
  try {
    const referrals = await db
      .select({
        id: userReferrals.id,
        referredUserId: userReferrals.referredUserId,
        referralCodeId: userReferrals.referralCodeId,
        createdAt: userReferrals.createdAt,
        referredUserEmail: users.email,
        referredUsername: users.username,
        code: referralCodes.code,
      })
      .from(userReferrals)
      .innerJoin(users, eq(userReferrals.referredUserId, users.userid))
      .innerJoin(referralCodes, eq(userReferrals.referralCodeId, referralCodes.id))
      .where(eq(userReferrals.referrerUserId, userId))
      .orderBy(sql`${userReferrals.createdAt} DESC`);

    return { success: true, referrals };
  } catch (error) {
    console.error('Error fetching user referrals:', error);
    return { success: false, referrals: [] };
  }
}

/**
 * Deactivate a referral code
 */
export async function deactivateReferralCode(
  codeId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await db
      .update(referralCodes)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(referralCodes.id, codeId), eq(referralCodes.createdByUserId, userId)))
      .returning();

    if (result.length === 0) {
      return { success: false, message: 'Referral code not found or unauthorized' };
    }

    return { success: true, message: 'Referral code deactivated successfully' };
  } catch (error) {
    console.error('Error deactivating referral code:', error);
    return { success: false, message: 'Failed to deactivate referral code' };
  }
}

/**
 * Reactivate a referral code
 */
export async function reactivateReferralCode(
  codeId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await db
      .update(referralCodes)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(and(eq(referralCodes.id, codeId), eq(referralCodes.createdByUserId, userId)))
      .returning();

    if (result.length === 0) {
      return { success: false, message: 'Referral code not found or unauthorized' };
    }

    return { success: true, message: 'Referral code reactivated successfully' };
  } catch (error) {
    console.error('Error reactivating referral code:', error);
    return { success: false, message: 'Failed to reactivate referral code' };
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string) {
  try {
    const [stats] = await db
      .select({
        totalCodes: sql<number>`COUNT(DISTINCT ${referralCodes.id})`,
        activeCodes: sql<number>`COUNT(DISTINCT CASE WHEN ${referralCodes.isActive} THEN ${referralCodes.id} END)`,
        totalReferrals: sql<number>`COUNT(DISTINCT ${userReferrals.id})`,
      })
      .from(referralCodes)
      .leftJoin(userReferrals, eq(referralCodes.id, userReferrals.referralCodeId))
      .where(eq(referralCodes.createdByUserId, userId));

    return {
      success: true,
      stats: {
        totalCodes: Number(stats?.totalCodes || 0),
        activeCodes: Number(stats?.activeCodes || 0),
        totalReferrals: Number(stats?.totalReferrals || 0),
      },
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return {
      success: false,
      stats: { totalCodes: 0, activeCodes: 0, totalReferrals: 0 },
    };
  }
}
