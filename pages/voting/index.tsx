import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import {
  VoteOptionEntity,
  VoteOptionModel,
} from "../../components/Voting/types";
import { Voting } from "../../components/Voting";
import { getSupabaseClient } from "../../utils/getSupabaseClient";
import { getCurrentRound } from "../../components/shared/queries";
import { getIsSuccess } from "../../utils/utils";

const VotingPage = ({
  voteOptions,
  roundId,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <Voting voteOptions={voteOptions} roundId={roundId} />;
};

export const getStaticProps: GetStaticProps = async () => {
  const supabase = getSupabaseClient();
  const { roundId, status } = await getCurrentRound(supabase);
  if (!getIsSuccess(status)) {
    throw new Error("failed to get RoundId");
  }

  const { data: resultEntities, error } = await supabase
    .from("sign_ups")
    .select(
      `
      round_id,
      song_id,
      song:songs (
          title,
          artist
      )
  `
    )
    .eq("round_id", roundId);

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  const voteOptions =
    resultEntities?.map((result) => {
      return result && entityToModel(result as VoteOptionEntity);
    }) || [];

  return {
    props: {
      voteOptions,
      roundId,
    },
    notFound: process.env.NODE_ENV === "production",
  };
};

export default VotingPage;

const entityToModel = ({
  song,
  song_id,
  round_id,
}: VoteOptionEntity): VoteOptionModel => {
  const { artist, title } = song;
  if (!artist || !title) {
    // throw new Error("artist or title is null");
  }
  return {
    artist,
    songTitle: title,
    roundId: round_id,
    label: `${title} by ${artist}`,
    field: song_id.toString(),
  };
};
