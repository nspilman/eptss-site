"use server";
import { userParticipationService } from "@/data-access/userParticipationService";
import { userSessionService } from "@/data-access/userSessionService";
import { roundService } from "@/data-access/roundService";

// Define a custom hook for easy access to the UserSessionContext
interface Props {
  roundId?: number;
}

export const userParticipationProvider = async (props?: Props) => {
  const roundIdOverride = props?.roundId;

  const { user } = await userSessionService.getUserSession();

  const userId = user?.id || "";
  if (!userId) {
    return {
      getUserRoundDetails: undefined,
      userId,
    };
  }

  const roundId = await roundService.getCurrentRoundId();

  const chosenRoundId = roundIdOverride || roundId;

  const getUserRoundDetails = async () => {
    if (!chosenRoundId) {
      return;
    }
    const data = await userParticipationService.getRoundDataForUser(
      chosenRoundId,
      userId
    );
    return data;
  };

  return {
    userRoundDetails: await getUserRoundDetails(),
    userId,
  };
};
