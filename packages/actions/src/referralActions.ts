"use server";

import {
  createReferralCode,
  validateReferralCode,
  getUserReferralCodes,
  getUserReferrals,
  deactivateReferralCode,
  reactivateReferralCode,
  getReferralStats,
  getAllReferralCodes,
  getAllUserReferrals,
  getSystemReferralStats,
} from "@eptss/referrals/services";
import { createClient } from "@eptss/core/utils/supabase/server";
import { logger } from "@eptss/logger/server";
import { isAdmin } from "@eptss/core/utils/isAdmin";

/**
 * Server Action: Create a new referral code for the current user
 */
export async function createUserReferralCode(options?: {
  maxUses?: number | null;
  expiresAt?: Date | null;
}) {
  logger.action("createUserReferralCode", "started");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.action("createUserReferralCode", "failed", {
        reason: "User not authenticated",
      });
      return { success: false, message: "User not authenticated" };
    }

    const result = await createReferralCode(user.id, options);
    logger.action("createUserReferralCode", "completed", {
      success: result.success,
    });

    return result;
  } catch (error) {
    logger.action("createUserReferralCode", "failed", {
      error: error instanceof Error ? error : undefined,
    });
    return { success: false, message: "Failed to create referral code" };
  }
}

/**
 * Server Action: Validate a referral code
 */
export async function checkReferralCode(code: string) {
  logger.action("checkReferralCode", "started", { code });

  try {
    const result = await validateReferralCode(code);
    logger.action("checkReferralCode", "completed", {
      valid: result.valid,
    });

    return result;
  } catch (error) {
    logger.action("checkReferralCode", "failed", {
      error: error instanceof Error ? error : undefined,
    });
    return { valid: false, message: "Failed to validate referral code" };
  }
}

/**
 * Server Action: Get all referral codes for the current user
 */
export async function getMyReferralCodes() {
  logger.action("getMyReferralCodes", "started");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.action("getMyReferralCodes", "failed", {
        reason: "User not authenticated",
      });
      return { success: false, codes: [] };
    }

    const result = await getUserReferralCodes(user.id);
    logger.action("getMyReferralCodes", "completed", {
      codesCount: result.codes.length,
    });

    return result;
  } catch (error) {
    logger.action("getMyReferralCodes", "failed", {
      error: error instanceof Error ? error : undefined,
    });
    return { success: false, codes: [] };
  }
}

/**
 * Server Action: Get all users referred by the current user
 */
export async function getMyReferrals() {
  logger.action("getMyReferrals", "started");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.action("getMyReferrals", "failed", {
        reason: "User not authenticated",
      });
      return { success: false, referrals: [] };
    }

    const result = await getUserReferrals(user.id);
    logger.action("getMyReferrals", "completed", {
      referralsCount: result.referrals.length,
    });

    return result;
  } catch (error) {
    logger.action("getMyReferrals", "failed", {
      error: error instanceof Error ? error : undefined,
    });
    return { success: false, referrals: [] };
  }
}

/**
 * Server Action: Deactivate a referral code
 */
export async function deactivateMyReferralCode(codeId: string) {
  logger.action("deactivateMyReferralCode", "started", { codeId });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.action("deactivateMyReferralCode", "failed", {
        reason: "User not authenticated",
      });
      return { success: false, message: "User not authenticated" };
    }

    const result = await deactivateReferralCode(codeId, user.id);
    logger.action("deactivateMyReferralCode", "completed", {
      success: result.success,
    });

    return result;
  } catch (error) {
    logger.action("deactivateMyReferralCode", "failed", {
      error: error instanceof Error ? error : undefined,
    });
    return { success: false, message: "Failed to deactivate referral code" };
  }
}

/**
 * Server Action: Reactivate a referral code
 */
export async function reactivateMyReferralCode(codeId: string) {
  logger.action("reactivateMyReferralCode", "started", { codeId });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.action("reactivateMyReferralCode", "failed", {
        reason: "User not authenticated",
      });
      return { success: false, message: "User not authenticated" };
    }

    const result = await reactivateReferralCode(codeId, user.id);
    logger.action("reactivateMyReferralCode", "completed", {
      success: result.success,
    });

    return result;
  } catch (error) {
    logger.action("reactivateMyReferralCode", "failed", {
      error: error instanceof Error ? error : undefined,
    });
    return { success: false, message: "Failed to reactivate referral code" };
  }
}

/**
 * Server Action: Get referral statistics for the current user
 */
export async function getMyReferralStats() {
  logger.action("getMyReferralStats", "started");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.action("getMyReferralStats", "failed", {
        reason: "User not authenticated",
      });
      return {
        success: false,
        stats: { totalCodes: 0, activeCodes: 0, totalReferrals: 0 },
      };
    }

    const result = await getReferralStats(user.id);
    logger.action("getMyReferralStats", "completed", {
      stats: result.stats,
    });

    return result;
  } catch (error) {
    logger.action("getMyReferralStats", "failed", {
      error: error instanceof Error ? error : undefined,
    });
    return {
      success: false,
      stats: { totalCodes: 0, activeCodes: 0, totalReferrals: 0 },
    };
  }
}

/**
 * ADMIN Server Action: Get all referral codes system-wide
 */
export async function adminGetAllReferralCodes() {
  logger.action("adminGetAllReferralCodes", "started");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !(await isAdmin())) {
      logger.action("adminGetAllReferralCodes", "failed", {
        reason: "User not authenticated or not admin",
      });
      return { success: false, codes: [] };
    }

    const result = await getAllReferralCodes();
    logger.action("adminGetAllReferralCodes", "completed", {
      codesCount: result.codes.length,
    });

    return result;
  } catch (error) {
    logger.action("adminGetAllReferralCodes", "failed", {
      error: error instanceof Error ? error : undefined,
    });
    return { success: false, codes: [] };
  }
}

/**
 * ADMIN Server Action: Get all user referrals system-wide
 */
export async function adminGetAllUserReferrals() {
  logger.action("adminGetAllUserReferrals", "started");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !(await isAdmin())) {
      logger.action("adminGetAllUserReferrals", "failed", {
        reason: "User not authenticated or not admin",
      });
      return { success: false, referrals: [] };
    }

    const result = await getAllUserReferrals();
    logger.action("adminGetAllUserReferrals", "completed", {
      referralsCount: result.referrals.length,
    });

    return result;
  } catch (error) {
    logger.action("adminGetAllUserReferrals", "failed", {
      error: error instanceof Error ? error : undefined,
    });
    return { success: false, referrals: [] };
  }
}

/**
 * ADMIN Server Action: Get system-wide referral statistics
 */
export async function adminGetSystemReferralStats() {
  logger.action("adminGetSystemReferralStats", "started");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !(await isAdmin())) {
      logger.action("adminGetSystemReferralStats", "failed", {
        reason: "User not authenticated or not admin",
      });
      return {
        success: false,
        stats: { totalCodes: 0, activeCodes: 0, totalReferrals: 0, totalUsersWithCodes: 0 },
      };
    }

    const result = await getSystemReferralStats();
    logger.action("adminGetSystemReferralStats", "completed", {
      stats: result.stats,
    });

    return result;
  } catch (error) {
    logger.action("adminGetSystemReferralStats", "failed", {
      error: error instanceof Error ? error : undefined,
    });
    return {
      success: false,
      stats: { totalCodes: 0, activeCodes: 0, totalReferrals: 0, totalUsersWithCodes: 0 },
    };
  }
}
