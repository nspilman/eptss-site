"use server";
import { getCurrentRoundId, getRoundDataForUser, getUser } from "@/data-access";

// Define a custom hook for easy access to the UserSessionContext
interface Props {
  roundId?: number;
}

export const userParticipationProvider = async (props?: Props) => {
  const roundIdOverride = props?.roundId;

  const { user } = await getUser();

  const userId = user?.id || "";
  if (!userId) {
    return {
      getUserRoundDetails: undefined,
      userId,
    };
  }

  const roundId = await getCurrentRoundId();

  const chosenRoundId = roundIdOverride || roundId;

  const getUserRoundDetails = async () => {
    if (!chosenRoundId) {
      return;
    }
    const data = await getRoundDataForUser(chosenRoundId, userId);
    return data;
  };

  return {
    userRoundDetails: await getUserRoundDetails(),
    userId,
  };
};
