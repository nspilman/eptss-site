"use server";

import { signupUserWithoutSong } from "@/data-access";
import { FormReturn } from "@/types";
import { revalidatePath } from "next/cache";
import { Navigation } from "@/enum/navigation";
import { signupForRoundSchema } from "@/lib/schemas/actionSchemas";
import { signupRateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

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
    const result = await signupUserWithoutSong({ roundId, userId });
    
    if (result.status !== 'Success') {
      logger.error('Signup failed', { 
        userId, 
        roundId, 
        error: result.message 
      });
      return result;
    }
    
    // 4. Revalidate cache
    revalidatePath(Navigation.Dashboard);
    
    // 5. Log success
    logger.info('User signed up for round', { userId, roundId });
    
    return { 
      status: "Success", 
      message: "Successfully signed up for the round!" 
    };
    
  } catch (error) {
    logger.error('Signup error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return { 
      status: "Error", 
      message: "An unexpected error occurred. Please try again." 
    };
  }
}

/**
 * Wrapper function for client-side usage
 * @deprecated Use signupForRound directly - both now return FormReturn
 */
export async function signupForRoundWithResult(formData: FormData): Promise<FormReturn> {
  return signupForRound(formData);
}
