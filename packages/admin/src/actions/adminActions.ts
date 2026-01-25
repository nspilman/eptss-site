"use server";

import { adminSignupUser as adminSignupUserService } from "@eptss/core/services/signupService";
import { adminSubmitCover as adminSubmitCoverService } from "@eptss/core/services/submissionService";
import { updateFeedbackPublicStatus as updateFeedbackPublicStatusService, deleteFeedback as deleteFeedbackService } from "@eptss/core/services/feedbackService";
import { FormReturn } from "@eptss/core/types/index";
import { logger } from "@eptss/logger/server";
import { getUserInfo } from "@eptss/core";
import { createRound as createRoundService, getRoundById, formatDate } from "@eptss/rounds/services";
import { revalidatePath } from "next/cache";
import { routes } from "@eptss/routing";
import {
  sendRoundSignupConfirmation,
  sendSubmissionConfirmation
} from "@eptss/email";

/**
 * Admin action to manually sign up a user for a round
 * Used by admins to add users to rounds
 */
export async function adminSignupUser(formData: FormData): Promise<FormReturn> {
  try {
    const userId = formData.get("userId")?.toString() || "";
    const roundId = Number(formData.get("roundId"));
    const songTitle = formData.get("songTitle")?.toString() || "";
    const artist = formData.get("artist")?.toString() || "";
    const youtubeLink = formData.get("youtubeLink")?.toString() || "";
    const providedSongId = formData.get("songId")?.toString();

    logger.info('Admin signup initiated', { userId, roundId });

    const result = await adminSignupUserService(formData);

    if (result.status === 'Success') {
      revalidatePath(routes.admin.root());
      logger.info('Admin signup successful', { userId, roundId });

      // Send confirmation emails (don't fail if emails fail)
      // Only send emails if signing up with a song (not songId === "-1")
      if (providedSongId !== "-1") {
        try {
          // Fetch user and round data for email
          const user = await getUserInfo(userId);
          const roundResult = await getRoundById(roundId);

          if (user && roundResult.status === 'success') {
            const round = roundResult.data;
            await sendRoundSignupConfirmation({
              to: user.email,
              userName: user.username || user.email,
              roundName: round.slug || `Round ${round.roundId}`,
              songTitle,
              artist,
              youtubeLink,
              roundSlug: round.slug || round.roundId.toString(),
              phaseDates: {
                votingOpens: formatDate.compact(round.votingOpens),
                coveringBegins: formatDate.compact(round.coveringBegins),
                coversDue: formatDate.compact(round.coversDue),
                listeningParty: formatDate.compact(round.listeningParty),
              },
            });
            logger.info('Admin signup email sent', { userId, roundId });
          } else {
            logger.warn('Could not send signup email - missing user or round data', { userId, roundId });
          }
        } catch (emailError) {
          logger.error('Failed to send admin signup email', {
            error: emailError instanceof Error ? emailError.message : 'Unknown error',
            userId,
            roundId,
          });
          // Don't fail the operation if email fails
        }
      }
    } else {
      logger.error('Admin signup failed', {
        userId,
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
    const soundcloudUrl = formData.get("soundcloudUrl")?.toString() || "";
    const additionalComments = formData.get("additionalComments")?.toString() || "";

    logger.info('Admin cover submission initiated', { userId, roundId });

    const result = await adminSubmitCoverService(formData);

    if (result.status === 'Success') {
      revalidatePath(routes.admin.root());
      logger.info('Admin cover submission successful', { userId, roundId });

      // Send confirmation emails (don't fail if emails fail)
      try {
        // Fetch user and round data for email
        const user = await getUserInfo(userId);
        const roundResult = await getRoundById(roundId);

        if (user && roundResult.status === 'success') {
          const round = roundResult.data;
          await sendSubmissionConfirmation({
            userEmail: user.email,
            userName: user.username || user.email,
            roundName: round.slug || `Round ${round.roundId}`,
            roundSlug: round.slug || round.roundId.toString(),
            soundcloudUrl,
            additionalComments: additionalComments ? {
              coolThingsLearned: additionalComments
            } : undefined,
            listeningPartyDate: formatDate.compact(round.listeningParty),
          });
          logger.info('Admin submission email sent', { userId, roundId });
        } else {
          logger.warn('Could not send submission email - missing user or round data', { userId, roundId });
        }
      } catch (emailError) {
        logger.error('Failed to send admin submission email', {
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
          userId,
          roundId,
        });
        // Don't fail the operation if email fails
      }
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
    const projectId = formData.get("projectId")?.toString();
    const slug = formData.get("slug")?.toString() || "";
    const signupOpens = new Date(formData.get("signupOpens")?.toString() || "");
    const votingOpens = new Date(formData.get("votingOpens")?.toString() || "");
    const coveringBegins = new Date(formData.get("coveringBegins")?.toString() || "");
    const coversDue = new Date(formData.get("coversDue")?.toString() || "");
    const listeningParty = new Date(formData.get("listeningParty")?.toString() || "");
    const playlistUrl = formData.get("playlistUrl")?.toString();

    if (!projectId) {
      return {
        status: "Error",
        message: "projectId is required"
      };
    }

    logger.info('Admin round creation initiated', { projectId, slug });

    const result = await createRoundService({
      projectId,
      slug,
      signupOpens,
      votingOpens,
      coveringBegins,
      coversDue,
      listeningParty,
      playlistUrl,
    });

    if (result.status === 'success') {
      revalidatePath(routes.admin.root());
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

/**
 * Admin action to update feedback public status
 */
export async function updateFeedbackPublicStatus(
  feedbackId: string,
  isPublic: boolean
): Promise<FormReturn> {
  try {
    const result = await updateFeedbackPublicStatusService(feedbackId, isPublic);
    revalidatePath(routes.admin.root());

    if (result.status === 'success') {
      return {
        status: "Success",
        message: "Feedback status updated successfully"
      };
    } else {
      return {
        status: "Error",
        message: result.error?.message || "Failed to update feedback status"
      };
    }
  } catch (error) {
    logger.error('Update feedback public status error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return {
      status: "Error",
      message: "Failed to update feedback status"
    };
  }
}

/**
 * Admin action to delete feedback
 */
export async function deleteFeedback(feedbackId: string): Promise<FormReturn> {
  try {
    const result = await deleteFeedbackService(feedbackId);
    revalidatePath(routes.admin.root());

    if (result.status === 'success') {
      return {
        status: "Success",
        message: "Feedback deleted successfully"
      };
    } else {
      return {
        status: "Error",
        message: result.error?.message || "Failed to delete feedback"
      };
    }
  } catch (error) {
    logger.error('Delete feedback error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return {
      status: "Error",
      message: "Failed to delete feedback"
    };
  }
}
