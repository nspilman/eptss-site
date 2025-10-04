"use server";

import { sendRoundSignupConfirmation, sendVotingConfirmation, sendSubmissionConfirmation } from "@/services/emailService";
import { getAuthUser } from "@/utils/supabase/server";
import { getCurrentRound } from "@/data-access";
import { formatDate } from "@/services/dateService";

export async function sendTestSignupEmail() {
  try {
    const { email } = await getAuthUser();
    
    if (!email) {
      return {
        success: false,
        error: "No email found for current user",
      };
    }

    const currentRoundResult = await getCurrentRound();
    
    let roundName = "Test Round";
    let roundSlug = "test-round";
    let phaseDates = {
      votingOpens: formatDate.compact(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      coveringBegins: formatDate.compact(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
      coversDue: formatDate.compact(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)),
      listeningParty: formatDate.compact(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    };

    if (currentRoundResult.status === 'success' && currentRoundResult.data) {
      const round = currentRoundResult.data;
      roundName = round.slug || `Round ${round.roundId}`;
      roundSlug = round.slug || round.roundId.toString();
      phaseDates = {
        votingOpens: formatDate.compact(round.votingOpens),
        coveringBegins: formatDate.compact(round.coveringBegins),
        coversDue: formatDate.compact(round.coversDue),
        listeningParty: formatDate.compact(round.listeningParty),
      };
    }

    const result = await sendRoundSignupConfirmation({
      to: email,
      userName: email.split('@')[0],
      roundName,
      songTitle: "Bohemian Rhapsody",
      artist: "Queen",
      youtubeLink: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
      roundSlug,
      phaseDates,
    });

    if (result.success) {
      return {
        success: true,
        message: `Test signup email sent to ${email}`,
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to send email",
      };
    }
  } catch (error) {
    console.error("Error sending test signup email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function sendTestVotingEmail() {
  try {
    const { email } = await getAuthUser();
    
    if (!email) {
      return {
        success: false,
        error: "No email found for current user",
      };
    }

    const currentRoundResult = await getCurrentRound();
    
    let roundName = "Test Round";
    let roundSlug = "test-round";
    let phaseDates = {
      coveringBegins: formatDate.compact(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      coversDue: formatDate.compact(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)),
      listeningParty: formatDate.compact(new Date(Date.now() + 23 * 24 * 60 * 60 * 1000)),
    };

    if (currentRoundResult.status === 'success' && currentRoundResult.data) {
      const round = currentRoundResult.data;
      roundName = round.slug || `Round ${round.roundId}`;
      roundSlug = round.slug || round.roundId.toString();
      phaseDates = {
        coveringBegins: formatDate.compact(round.coveringBegins),
        coversDue: formatDate.compact(round.coversDue),
        listeningParty: formatDate.compact(round.listeningParty),
      };
    }

    const result = await sendVotingConfirmation({
      userEmail: email,
      userName: email.split('@')[0],
      roundName,
      roundSlug,
      votedSongs: [
        { title: "Bohemian Rhapsody", artist: "Queen", rating: 5 },
        { title: "Stairway to Heaven", artist: "Led Zeppelin", rating: 4 },
        { title: "Hotel California", artist: "Eagles", rating: 5 },
      ],
      phaseDates,
    });

    if (result.success) {
      return {
        success: true,
        message: `Test voting email sent to ${email}`,
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to send email",
      };
    }
  } catch (error) {
    console.error("Error sending test voting email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function sendTestSubmissionEmail() {
  try {
    const { email } = await getAuthUser();
    
    if (!email) {
      return {
        success: false,
        error: "No email found for current user",
      };
    }

    const currentRoundResult = await getCurrentRound();
    
    let roundName = "Test Round";
    let roundSlug = "test-round";
    let listeningPartyDate = formatDate.compact(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    if (currentRoundResult.status === 'success' && currentRoundResult.data) {
      const round = currentRoundResult.data;
      roundName = round.slug || `Round ${round.roundId}`;
      roundSlug = round.slug || round.roundId.toString();
      listeningPartyDate = formatDate.compact(round.listeningParty);
    }

    const result = await sendSubmissionConfirmation({
      userEmail: email,
      userName: email.split('@')[0],
      roundName,
      roundSlug,
      soundcloudUrl: "https://soundcloud.com/example/test-track",
      additionalComments: {
        coolThingsLearned: "Learned how to layer harmonies effectively",
        toolsUsed: "Logic Pro X, Shure SM7B, Fender Stratocaster",
        happyAccidents: "Accidentally created a cool reverb effect",
        didntWork: "Initial drum pattern was too busy",
      },
      listeningPartyDate,
    });

    if (result.success) {
      return {
        success: true,
        message: `Test submission email sent to ${email}`,
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to send email",
      };
    }
  } catch (error) {
    console.error("Error sending test submission email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
