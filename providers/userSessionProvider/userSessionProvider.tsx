"use server";
import { userParticipationService } from "@/data-access/userParticipationService";
import { userSessionService } from "@/data-access/userSessionService";
import { roundService } from "@/data-access/roundService";

// Define a custom hook for easy access to the UserSessionContext
interface Props {
  roundId?: number;
}

export const userSessionProvider = async (props?: Props) => {
  const roundIdOverride = props?.roundId;

  const { user, session } = await userSessionService.getUserSession();
  const { signOut } = userSessionService;

  const userId = user?.id || "";
  if (!userId) {
    return {
      session: undefined,
      getUserRoundDetails: undefined,
      signOut: undefined,
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
    session,
    userRoundDetails: await getUserRoundDetails(),
    signOut,
  };
};
