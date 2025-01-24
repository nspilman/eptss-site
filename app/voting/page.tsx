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

  const transformedVoteOptions = voteOptions.map(option => ({
    label: `${option.song.title} - ${option.song.artist}`,
    field: `vote_${option.songId}`,
    placeholder: option.youtubeLink ? 'YouTube link available' : undefined,
  }));

  return (
    <VotingPage
      {...{
        roundId,
        voteOptions: transformedVoteOptions,
        phase,
        coveringStartLabel,
        userRoundDetails: roundDetails
      }}
    />
  );
};

export default VotingPageHome;
