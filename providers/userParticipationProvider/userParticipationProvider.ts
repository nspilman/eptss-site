"use server";
import { getCurrentRoundId, getRoundDataForUser, signup, submitCover, submitVotes } from "@/data-access";
import { getAuthUser } from "@/utils/supabase/server";

// Define a custom hook for easy access to the UserSessionContext
interface Props {
  roundId?: number;
}

export const userParticipationProvider = async (props?: Props) => {
  const roundIdOverride = props?.roundId;

  const { userId } = getAuthUser();

  const services = {signup, submitCover, submitVotes, roundDetails: undefined}

  if (!userId) {
    return services
  }

  const roundId = await getCurrentRoundId();

  const chosenRoundId = roundIdOverride || roundId;

  const getUserRoundDetails = async () => {
    if (!chosenRoundId) {
      return undefined;
    }
    const data = await getRoundDataForUser(chosenRoundId);
    return data;
  };

  const roundDetails = await getUserRoundDetails();

  return {...services, roundDetails };
};
