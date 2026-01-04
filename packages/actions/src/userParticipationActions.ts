"use server";

import {
  signup as signupService,
  signupWithOTP as signupWithOTPService,
  completeSignupAfterVerification as completeSignupAfterVerificationService,
  verifySignupByEmail as verifySignupByEmailService,
} from "@eptss/data-access/services/signupService";
import { submitCover as submitCoverService } from "@eptss/data-access/services/submissionService";
import { submitVotes as submitVotesService } from "@eptss/data-access/services/votesService";
import { getAuthUser } from "@eptss/data-access/utils/supabase/server";
import type { FormReturn } from "@eptss/data-access/types/index";
import { revalidatePath } from "next/cache";
import { signupSchema, FIELD_LABELS } from "@eptss/data-access";
import { validateFormData } from "@eptss/data-access/utils/formDataHelpers";
import { submitVotesSchema, submitCoverSchema } from "@eptss/data-access/schemas/actionSchemas";
import { logger } from "@eptss/logger/server";
import {
  votingRateLimit,
  submissionRateLimit,
  signupRateLimit,
  emailRateLimit
} from "@eptss/data-access/config/rateLimiters";

/**
 * Server Action: Submit votes for a round
 * Includes email confirmation on success
 */
export async function submitVotes(roundId: number, formData: FormData): Promise<FormReturn> {
  try {
    // 1. Authenticate
    const { userId } = await getAuthUser();
    if (!userId) {
      return { status: "Error", message: "Please log in to vote" };
    }

    // 2. Validate input
    const validation = submitVotesSchema.safeParse({ roundId });
    if (!validation.success) {
      logger.warn('Vote validation failed', { errors: validation.error.errors });
      return {
        status: "Error",
        message: validation.error.errors[0].message
      };
    }

    // 3. Rate limit
    const { success } = await votingRateLimit.limit(`vote:${userId}`);
    if (!success) {
      logger.warn('Voting rate limit exceeded', { userId, roundId });
      return {
        status: "Error",
        message: "Too many voting attempts. Please try again later."
      };
    }

    // 4. Submit votes
    const result = await submitVotesService(roundId, formData);

    if (result.status !== 'Success') {
      logger.error('Vote submission failed', { userId, roundId });
      return result;
    }

    // Note: Email confirmation can be added here if needed
    // TODO: Consider adding voting confirmation email

    // 6. Revalidate cache
    revalidatePath(`/voting/${roundId}`);

    // 7. Log success
    logger.info('Votes submitted', { userId, roundId });

    return result;

  } catch (error) {
    logger.error('Vote submission error', {
      error: error instanceof Error ? error : undefined,
      roundId,
    });

    return {
      status: "Error",
      message: "Failed to submit votes. Please try again."
    };
  }
}

/**
 * Server Action: Submit a cover for a round
 * Includes email confirmation on success
 */
export async function submitCover(formData: FormData): Promise<FormReturn> {
  try {
    // 1. Authenticate
    const { userId } = await getAuthUser();
    if (!userId) {
      return { status: "Error", message: "Please log in to submit a cover" };
    }

    // 2. Validate input
    const roundId = Number(formData.get("roundId")?.toString() || "-1");

    // Helper to get value or undefined (handles empty strings and null)
    // Don't convert to String - let the schema handle type conversion
    const getValue = (value: FormDataEntryValue | null): FormDataEntryValue | undefined => {
      if (!value || value === '' || value === 'undefined' || value === 'null') return undefined;
      return value;
    };

    // Build validation input, only including defined values for optional fields
    const validationInput: Record<string, unknown> = {
      roundId: formData.get("roundId"),
      audioFileUrl: formData.get("audioFileUrl"),
      audioFilePath: formData.get("audioFilePath"),
    };

    // Only add optional fields if they have values
    const coverImageUrl = getValue(formData.get("coverImageUrl"));
    if (coverImageUrl !== undefined) validationInput.coverImageUrl = coverImageUrl;

    const coverImagePath = getValue(formData.get("coverImagePath"));
    if (coverImagePath !== undefined) validationInput.coverImagePath = coverImagePath;

    const audioDuration = getValue(formData.get("audioDuration"));
    if (audioDuration !== undefined) validationInput.audioDuration = audioDuration;

    const audioFileSize = getValue(formData.get("audioFileSize"));
    if (audioFileSize !== undefined) validationInput.audioFileSize = audioFileSize;

    const coolThingsLearned = getValue(formData.get("coolThingsLearned"));
    if (coolThingsLearned !== undefined) validationInput.coolThingsLearned = coolThingsLearned;

    const toolsUsed = getValue(formData.get("toolsUsed"));
    if (toolsUsed !== undefined) validationInput.toolsUsed = toolsUsed;

    const happyAccidents = getValue(formData.get("happyAccidents"));
    if (happyAccidents !== undefined) validationInput.happyAccidents = happyAccidents;

    const didntWork = getValue(formData.get("didntWork"));
    if (didntWork !== undefined) validationInput.didntWork = didntWork;

    const validation = submitCoverSchema.safeParse(validationInput);

    if (!validation.success) {
      logger.warn('Cover submission validation failed', { errors: validation.error.errors });

      // Create human-friendly error messages using shared field labels
      const errorMessages = validation.error.errors.map(err => {
        const fieldPath = err.path.join('.');
        const fieldLabel = FIELD_LABELS[fieldPath] || fieldPath;
        return `${fieldLabel}: ${err.message}`;
      }).join(', ');

      return {
        status: "Error",
        message: errorMessages
      };
    }

    // 3. Rate limit
    const { success } = await submissionRateLimit.limit(`submission:${userId}`);
    if (!success) {
      logger.warn('Submission rate limit exceeded', { userId, roundId });
      return {
        status: "Error",
        message: "Too many submission attempts. Please try again later."
      };
    }

    // 4. Submit cover
    const result = await submitCoverService(formData);

    if (result.status !== 'Success') {
      logger.error('Cover submission failed', { userId, roundId });
      return result;
    }

    // Note: Email confirmation can be added here if needed
    // TODO: Consider adding submission confirmation email

    // 6. Revalidate cache
    const roundSlug = formData.get("roundSlug")?.toString();
    if (roundSlug) {
      revalidatePath(`/round/${roundSlug}`);
    }

    // 7. Log success
    logger.info('Cover submitted', { userId, roundId });

    return result;

  } catch (error) {
    logger.error('Cover submission error', {
      error: error instanceof Error ? error : undefined,
    });

    return {
      status: "Error",
      message: "Failed to submit cover. Please try again."
    };
  }
}

/**
 * Server Action: Sign up for a round
 * Includes email confirmation on success
 */
export async function signup(formData: FormData, providedUserId?: string): Promise<FormReturn> {
  const { userId } = await getAuthUser();
  const result = await signupService(formData, providedUserId);

  if (result.status === 'Success' && userId) {
    // Note: Email confirmation can be added here if needed
    // TODO: Consider adding signup confirmation email

    // Revalidate relevant pages
    const roundSlug = formData.get("roundSlug")?.toString();
    if (roundSlug) {
      revalidatePath(`/round/${roundSlug}`);
    }
    revalidatePath('/dashboard');
  }

  return result;
}

/**
 * Server Action: Sign up with OTP (for unverified users)
 *
 * NOTE: Validation is handled in the service layer based on project business rules.
 * Different projects may have different requirements (e.g., song required or not).
 */
export async function signupWithOTP(formData: FormData): Promise<FormReturn> {
  try {
    // 1. Basic validation - just check required fields exist
    const email = formData.get("email")?.toString();
    const roundId = formData.get("roundId");

    if (!email || !roundId) {
      logger.warn('OTP signup missing required fields', { hasEmail: !!email, hasRoundId: !!roundId });
      return {
        status: "Error",
        message: "Email and round ID are required"
      };
    }

    // 2. Rate limit by email
    const { success } = await emailRateLimit.limit(`otp-signup:${email}`);
    if (!success) {
      logger.warn('OTP signup rate limit exceeded', { email });
      return {
        status: "Error",
        message: "Too many signup attempts. Please try again later."
      };
    }

    // 3. Process signup (service validates based on project business rules)
    const result = await signupWithOTPService(formData);

    if (result.status !== 'Success') {
      logger.error('OTP signup failed', { email });
      return result;
    }

    // 4. Revalidate cache
    const roundSlug = formData.get("roundSlug")?.toString();
    if (roundSlug) {
      revalidatePath(`/sign-up/${roundSlug}`);
    }

    // 5. Log success
    logger.info('OTP signup initiated', { email });

    return result;

  } catch (error) {
    logger.error('OTP signup error', {
      error: error instanceof Error ? error : undefined,
    });

    return {
      status: "Error",
      message: "Failed to process signup. Please try again."
    };
  }
}

/**
 * Server Action: Complete signup after email verification
 */
export async function completeSignupAfterVerification(formData: FormData): Promise<FormReturn> {
  try {
    // 1. Authenticate
    const { userId } = await getAuthUser();
    if (!userId) {
      return { status: "Error", message: "Please log in to complete signup" };
    }

    // 2. Validate FormData with Zod
    const validation = validateFormData(formData, signupSchema);

    if (!validation.success) {
      logger.warn('Signup completion validation failed', {
        userId,
        error: validation.error
      });
      return { status: 'Error', message: validation.error };
    }

    // 3. Rate limit
    const { success } = await signupRateLimit.limit(`complete-signup:${userId}`);
    if (!success) {
      logger.warn('Signup completion rate limit exceeded', { userId });
      return {
        status: "Error",
        message: "Too many attempts. Please try again later."
      };
    }

    // 4. Complete signup
    const result = await completeSignupAfterVerificationService(validation.data);

    if (result.status !== 'Success') {
      logger.error('Signup completion failed', { userId });
      return result;
    }

    // 5. Revalidate cache
    revalidatePath('/dashboard');

    // 6. Log success
    logger.info('Signup completed after verification', { userId });

    return result;

  } catch (error) {
    logger.error('Signup completion error', {
      error: error instanceof Error ? error : undefined,
    });

    return {
      status: "Error",
      message: "Failed to complete signup. Please try again."
    };
  }
}

/**
 * Server Action: Verify signup by email
 * Includes email confirmation on success
 */
export async function verifySignupByEmail(): Promise<FormReturn> {
  const { userId } = await getAuthUser();
  const result = await verifySignupByEmailService();

  if (result.status === 'Success' && userId) {
    // Note: Email confirmation can be added here if needed
    // TODO: Consider adding verification confirmation email

    revalidatePath('/dashboard');
  }

  return result;
}
