"use server";
import { getCurrentRoundId, getRoundDataForUser } from "@/data-access";
import { getAuthUser } from "@/utils/supabase/server";

// Define a custom hook for easy access to the UserSessionContext
interface Props {
  roundId?: number;
}

export const userParticipationProvider = async (props?: Props) => {
  const roundIdOverride = props?.roundId;

  const { userId } = getAuthUser();

  if (!userId) {
    return
  }

  const roundId = await getCurrentRoundId();

  const chosenRoundId = roundIdOverride || roundId;

  const getUserRoundDetails = async () => {
    if (!chosenRoundId) {
      return;
    }
    const data = await getRoundDataForUser(chosenRoundId);
    return data;
  };
  
  return await getUserRoundDetails();
};
