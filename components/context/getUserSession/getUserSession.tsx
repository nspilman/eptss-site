"use server";
import { getNewPhaseManager } from "@/services/PhaseMgmtService";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getRoundDataForUser } from "queries/getRoundDataForUser";

// Define a custom hook for easy access to the UserSessionContext
interface Props {
  roundId?: number;
}

export const getUserSession = async (props?: Props) => {
  const roundIdOverride = props?.roundId;

  const headerCookies = await cookies();
  const supabaseClient = await createClient(headerCookies);

  const { data: session } = await supabaseClient.auth.getSession();

  const userId = session?.session?.user.id || "";
  if (!userId) {
    return {
      user: undefined,
      getUserRoundDetails: undefined,
      signOut: undefined,
    };
  }

  const signOut = () => supabaseClient.auth.signOut();
  const { roundId } = await getNewPhaseManager();

  const chosenRoundId = roundIdOverride || roundId;

  const getUserRoundDetails = async () => {
    if (!chosenRoundId) {
      return;
    }
    const data = await getRoundDataForUser(chosenRoundId, userId);
    return data;
  };

  return {
    user: session.session?.user,
    userRoundDetails: await getUserRoundDetails(),
    signOut,
  };
};
