"use server";
import { roundManager } from "@/services/roundManager";
import { userParticipationService } from "@/data-access/userParticipationService";
import { userSessionService } from "@/data-access/userSessionService";

// Define a custom hook for easy access to the UserSessionContext
interface Props {
  roundId?: number;
}

export const getUserSession = async (props?: Props) => {
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

  const { roundId } = await roundManager();

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
