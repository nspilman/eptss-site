import React from "react";
import {
  roundProvider,
  userParticipationProvider,
  userSessionProvider,
} from "@/providers";
import VotingPage from "./VotingPage";

const VotingPageHome = async () => {
  const {
    roundId,
    dateLabels: {
      covering: { opens: coveringStartLabel },
    },
    voteOptions,
    phase,
  } = await roundProvider();

  const { userId } = await userSessionProvider();
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
