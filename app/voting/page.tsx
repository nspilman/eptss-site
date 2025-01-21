import React from "react";
import {
  roundProvider,
  userParticipationProvider,
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


  const {roundDetails}  = await userParticipationProvider({ roundId });

  return (
    <VotingPage
      {...{
        roundId,
        voteOptions,
        phase,
        coveringStartLabel,
        userRoundDetails: roundDetails
      }}
    />
  );
};

export default VotingPageHome;
