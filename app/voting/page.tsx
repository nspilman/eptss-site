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

  return (
    <VotingPage
      {...{
        roundId,
        voteOptions,
        phase,
        coveringStartLabel,
      }}
    />
  );
};

export default VotingPageHome;
