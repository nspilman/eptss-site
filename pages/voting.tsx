import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { VoteOptionEntity, VoteOptionModel } from "components/Voting/types";
import { Voting } from "components/Voting";
import { getSignupsByRound } from "queries";
import { PhaseMgmtService } from "services/PhaseMgmtService";
import { SignInGate } from "components/shared/SignInGate";

const VotingPage = ({
  voteOptions,
  roundId,
  isVotingOpen,
  coveringStartString,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    isVotingOpen && (
      <SignInGate>
        <Voting
          voteOptions={voteOptions}
          roundId={roundId}
          coveringStartsLabel={coveringStartString}
        />
      </SignInGate>
    )
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const { roundId } = await PhaseMgmtService.build();

  const {
    phase,
    dateLabels: {
      covering: { opens: coveringStartString },
    },
  } = await PhaseMgmtService.build();

  // const isVotingOpen = phase === "voting";
  const isVotingOpen = true;
  const voteOptions = isVotingOpen ? await getVoteOptions(roundId) : [];

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
  const { data: resultEntities, error } = await getSignupsByRound(roundId);

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
  round_id,
  youtube_link,
}: VoteOptionEntity): VoteOptionModel => {
  const { artist, title } = song;
  if (!artist || !title) {
    throw new Error("artist or title is null");
  }
  return {
    artist,
    songTitle: title,
    roundId: round_id,
    label: `${title} by ${artist}`,
    field: song_id.toString(),
    link: youtube_link,
  };
};
