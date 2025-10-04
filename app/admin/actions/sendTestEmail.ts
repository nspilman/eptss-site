"use server";

import { sendRoundSignupConfirmation } from "@/services/emailService";
import { getAuthUser } from "@/utils/supabase/server";
import { getCurrentRound } from "@/data-access";
import { formatDate } from "@/services/dateService";

export async function sendTestSignupEmail() {
  try {
    // Get the current user's email
    const { email, userId } = await getAuthUser();
    
    if (!email) {
      return {
        success: false,
        error: "No email found for current user",
      };
    }

    // Get current round data for realistic test
    const currentRoundResult = await getCurrentRound();
    
    let roundName = "Test Round";
    let roundSlug = "test-round";
    let phaseDates = {
      votingOpens: formatDate.compact(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      coveringBegins: formatDate.compact(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
      coversDue: formatDate.compact(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)),
      listeningParty: formatDate.compact(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    };

    // Use real round data if available
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

    // Send test email
    const result = await sendRoundSignupConfirmation({
      to: email,
      userName: email.split('@')[0], // Use email prefix as name
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
        message: `Test email sent to ${email}`,
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to send email",
      };
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
