import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { VoteOptionEntity, VoteOptionModel } from "components/Voting/types";
import { Voting } from "components/Voting";
import queries from "queries";
import { PhaseMgmtService } from "services/PhaseMgmtService";
import { SignInGate } from "components/shared/SignInGate";
import seedrandom from "seedrandom";

const VotingPage = ({
  voteOptions,
  roundId,
  isVotingOpen,
  coveringStartString,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    isVotingOpen && (
      <Voting
        voteOptions={voteOptions}
        roundId={roundId}
        coveringStartsLabel={coveringStartString}
      />
    )
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const { roundId } = await PhaseMgmtService.build();

  const {
    dateLabels: {
      covering: { opens: coveringStartString },
    },
  } = await PhaseMgmtService.build();

  // const isVotingOpen = phase === "voting";
  const isVotingOpen = true;
  const unsortedVoteOptions = isVotingOpen ? await getVoteOptions(roundId) : [];

  const voteOptions = seededShuffle(
    unsortedVoteOptions,
    JSON.stringify(unsortedVoteOptions)
  );

  return {
    props: {
      voteOptions,
      roundId,
      isVotingOpen,
      coveringStartString,
    },
  };
};

export default VotingPage;

// private

const getVoteOptions = async (roundId: number) => {
  const { data: resultEntities, error } =
    await queries.signups.getSignupsByRound(roundId);

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  return (
    resultEntities
      ?.filter((result) => result.song_id)
      .map((result) => {
        return result && entityToModel(result as VoteOptionEntity);
      }) || []
  );
};

const entityToModel = ({
  song,
  song_id,
  youtube_link,
}: VoteOptionEntity): VoteOptionModel => {
  const { artist, title } = song;
  if (!artist || !title) {
    throw new Error("artist or title is null");
  }
  return {
    label: `${title} by ${artist}`,
    field: song_id.toString(),
    link: youtube_link,
  };
};

function seededShuffle<T>(array: T[], seed: string): T[] {
  const rng = seedrandom(seed);

  // Creating a new array to avoid modifying the original
  const newArray = array.slice();

  // Implementing the Fisher-Yates shuffle algorithm
  for (let i = newArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(rng() * (i + 1));
    // Swapping elements
    [newArray[i], newArray[randomIndex]] = [newArray[randomIndex], newArray[i]];
  }

  return newArray;
}
