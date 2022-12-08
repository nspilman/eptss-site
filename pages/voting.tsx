import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { VoteOptionEntity, VoteOptionModel } from "../components/Voting/types";
import { Voting } from "../components/Voting";
import { getSupabaseClient } from "../utils/getSupabaseClient";
import { getCurrentRound, getSignupsByRound } from "../queries";
import { getIsSuccess } from "../utils";
import { TimeBot5000 } from "utils/TimeBot5000";

const VotingPage = ({
  voteOptions,
  roundId,
  isVotingOpen,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return isVotingOpen && <Voting voteOptions={voteOptions} roundId={roundId} />;
};

const supabase = getSupabaseClient();

export const getStaticProps: GetStaticProps = async () => {
  const { roundId } = await getRound();
  const timebot5000 = await TimeBot5000.build();
  console.log(timebot5000.getCurrentPhase());
  const isVotingOpen = timebot5000.getCurrentPhase() === "voting";
  const voteOptions = isVotingOpen ? await getVoteOptions(roundId) : [];

  return {
    props: {
      voteOptions,
      roundId,
      isVotingOpen,
    },
  };
};

export default VotingPage;

// private

const getRound = async () => {
  const { roundId, votingOpens, coveringBegins, status } =
    await getCurrentRound(supabase);
  if (!getIsSuccess(status)) {
    throw new Error("failed to get RoundId");
  }
  return { roundId, votingOpens, coveringBegins };
};

const getVoteOptions = async (roundId: number) => {
  const { data: resultEntities, error } = await getSignupsByRound(
    supabase,
    roundId
  );

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
