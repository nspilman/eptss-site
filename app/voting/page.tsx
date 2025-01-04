import React from "react";
import {
  roundProvider,
  userParticipationProvider,
} from "@/providers";
import VotingPage from "./VotingPage";
import { getAuthUser } from "@/utils/supabase/server";

const VotingPageHome = async () => {
  const {
    roundId,
    dateLabels: {
      covering: { opens: coveringStartLabel },
    },
    voteOptions,
    phase,
  } = await roundProvider();

  const { userId } = getAuthUser();

  const { userRoundDetails } = await userParticipationProvider({ roundId });

  return (
    <VotingPage
      {...{
        roundId,
        voteOptions,
        phase,
        coveringStartLabel,
        userId,
        userRoundDetails
      }}
    />
  );
};

export default VotingPageHome;
