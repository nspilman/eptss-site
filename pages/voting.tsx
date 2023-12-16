import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { VoteOptionEntity, VoteOptionModel } from "components/Voting/types";
import { Voting } from "components/Voting";
import queries from "queries";
import { PhaseMgmtService } from "services/PhaseMgmtService";
import { SignInGate } from "components/shared/SignInGate";
import seedrandom from "seedrandom";
import { STATIC_REGEN_INTERVAL_SECONDS } from "consts";

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
  const {
    roundId,
    dateLabels: {
      covering: { opens: coveringStartString },
    },
  } = await PhaseMgmtService.build();
  const { typeOverride } = await queries.round.getCurrentRound();

  const isVotingOpen = true;
  const unsortedVoteOptions = isVotingOpen
    ? await getVoteOptions(roundId, typeOverride as "runner_up" | undefined)
    : [];

  const voteOptions =
    typeOverride === "runner_up"
      ? unsortedVoteOptions
      : seededShuffle(unsortedVoteOptions, JSON.stringify(unsortedVoteOptions));

  return {
    props: {
      voteOptions,
      roundId,
      isVotingOpen,
      coveringStartString,
    },
    revalidate: STATIC_REGEN_INTERVAL_SECONDS,
  };
};

export default VotingPage;

// private

const getVoteOptions = async (roundId: number, typeOverride?: "runner_up") => {
  const resultEntities:
    | {
        round_id: any;
        original_round_id?: any;
        song_id: any;
        song: {
          title: any;
          artist: any;
        }[];
      }[]
    | null = [];
  if (typeOverride === "runner_up") {
    const { data, error } = await queries.voting.getRoundOverrideVotes(roundId);
    data?.forEach((record) => record.song && resultEntities.push(record));
    if (error) {
      throw new Error(JSON.stringify(error));
    }
  } else {
    const { data, error } = await queries.signups.getSignupsByRound(roundId);
    data?.forEach((record) => resultEntities.push(record));
    if (error) {
      throw new Error(JSON.stringify(error));
    }
  }

  return (
    resultEntities
      ?.filter((result) => result.song_id)
      .map((result) => {
        return result && entityToModel(result as unknown as VoteOptionEntity);
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
    link: youtube_link || "",
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
