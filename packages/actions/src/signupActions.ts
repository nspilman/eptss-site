"use server";

import { signupUserWithoutSong } from "@eptss/data-access/services/signupService";
import { FormReturn } from "@eptss/data-access/types/index";
import { revalidatePath } from "next/cache";
import { routes } from "@eptss/routing";
import { signupForRoundSchema } from "@eptss/data-access/schemas/actionSchemas";
import { signupRateLimit } from "@eptss/data-access/utils/ratelimit";
import { logger } from "@eptss/logger/server";

/**
 * Sign up a user for a round without song selection
 * Used when joining during the covering phase
 */
export async function signupForRound(formData: FormData): Promise<FormReturn> {
  try {
    // 1. Validate input
    const validation = signupForRoundSchema.safeParse({
      roundId: formData.get("roundId"),
      userId: formData.get("userId"),
    });

    if (!validation.success) {
      logger.warn('Signup validation failed', {
        errors: validation.error.errors
      });
      return {
        status: "Error",
        message: validation.error.errors[0].message
      };
    }

    const { roundId, userId } = validation.data;

    // Extract projectId
    const projectId = formData.get("projectId")?.toString();
    if (!projectId) {
      logger.warn('Signup missing projectId', { userId, roundId });
      return {
        status: "Error",
        message: "projectId is required"
      };
    }

    // 2. Rate limit check
    const { success } = await signupRateLimit.limit(`signup:${userId}`);
    if (!success) {
      logger.warn('Signup rate limit exceeded', { userId, roundId });
      return {
        status: "Error",
        message: "Too many signup attempts. Please try again later."
      };
    }

    // 3. Perform signup
    const result = await signupUserWithoutSong({ projectId, roundId, userId });

    if (result.status !== 'Success') {
      logger.error('Signup failed', {
        userId,
        roundId,
        error: result.message
      });
      return result;
    }

    // 4. Revalidate cache
    revalidatePath(routes.dashboard.root());

    // 5. Log success
    logger.info('User signed up for round', { userId, roundId });

    return {
      status: "Success",
      message: "Successfully signed up for the round!"
    };

  } catch (error) {
    logger.error('Signup error', {
      error: error instanceof Error ? error : undefined,
    });

    return {
      status: "Error",
      message: "An unexpected error occurred. Please try again."
    };
  }
}
