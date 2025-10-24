"use server";

import { adminSignupUser as adminSignupUserService } from "../services/signupService";
import { adminSubmitCover as adminSubmitCoverService } from "../services/submissionService";
import { createRound as createRoundService } from "../services/roundService";
import { updateFeedbackPublicStatus as updateFeedbackPublicStatusService, deleteFeedback as deleteFeedbackService } from "../services/feedbackService";
import { FormReturn } from "../types";
import { revalidatePath } from "next/cache";
import { Navigation } from "@eptss/shared";
import { logger } from "../utils/logger";

/**
 * Admin action to manually sign up a user for a round
 * Used by admins to add users to rounds
 */
export async function adminSignupUser(formData: FormData): Promise<FormReturn> {
  try {
    const email = formData.get("email")?.toString() || "";
    const roundId = Number(formData.get("roundId"));

    logger.info('Admin signup initiated', { email, roundId });

    const result = await adminSignupUserService(formData);

    if (result.status === 'Success') {
      revalidatePath(Navigation.Admin);
      logger.info('Admin signup successful', { email, roundId });
    } else {
      logger.error('Admin signup failed', { 
        email, 
        roundId,
        error: result.message 
      });
    }

    return result;
  } catch (error) {
    logger.error('Admin signup error', {
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
 * Admin action to manually submit a cover for a user
 * Used by admins to add submissions on behalf of users
 */
export async function adminSubmitCover(formData: FormData): Promise<FormReturn> {
  try {
    const userId = formData.get("userId")?.toString() || "";
    const roundId = Number(formData.get("roundId"));

    logger.info('Admin cover submission initiated', { userId, roundId });

    const result = await adminSubmitCoverService(formData);

    if (result.status === 'Success') {
      revalidatePath(Navigation.Admin);
      logger.info('Admin cover submission successful', { userId, roundId });
    } else {
      logger.error('Admin cover submission failed', { 
        userId, 
        roundId,
        error: result.message 
      });
    }

    return result;
  } catch (error) {
    logger.error('Admin cover submission error', {
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
 * Admin action to create a new round
 * Used by admins to set up new rounds
 */
export async function createRoundAction(formData: FormData): Promise<FormReturn> {
  try {
    // Extract and parse form data
    const slug = formData.get("slug")?.toString() || "";
    const signupOpens = new Date(formData.get("signupOpens")?.toString() || "");
    const votingOpens = new Date(formData.get("votingOpens")?.toString() || "");
    const coveringBegins = new Date(formData.get("coveringBegins")?.toString() || "");
    const coversDue = new Date(formData.get("coversDue")?.toString() || "");
    const listeningParty = new Date(formData.get("listeningParty")?.toString() || "");
    const playlistUrl = formData.get("playlistUrl")?.toString();

    logger.info('Admin round creation initiated', { slug });

    const result = await createRoundService({
      slug,
      signupOpens,
      votingOpens,
      coveringBegins,
      coversDue,
      listeningParty,
      playlistUrl,
    });

    if (result.status === 'success') {
      revalidatePath(Navigation.Admin);
      logger.info('Admin round creation successful', { slug });
      return {
        status: "Success",
        message: "Round created successfully"
      };
    } else {
      logger.error('Admin round creation failed', { 
        slug,
        error: result.error?.message 
      });
      return {
        status: "Error",
        message: result.error?.message || "Failed to create round"
      };
    }
  } catch (error) {
    logger.error('Admin round creation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      status: "Error",
      message: "An unexpected error occurred. Please try again."
    };
  }
}
