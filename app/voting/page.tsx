import React from "react";
import {
  roundProvider,
  userParticipationProvider,
} from "@/providers";
import {VotingPage} from "./VotingPage";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Vote on Covers | Everyone Plays the Same Song",
  description: "Listen and vote on community-submitted cover versions. Help choose the standout performances in this round of Everyone Plays the Same Song.",
  openGraph: {
    title: "Vote on Covers | Everyone Plays the Same Song",
    description: "Listen and vote on community-submitted cover versions. Help choose the standout performances in this round of Everyone Plays the Same Song.",
  },
};

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
        songs: voteOptions,
        phase,
        coveringStartLabel,
        userRoundDetails: roundDetails
      }}
    />
  );
};

export default VotingPageHome;
