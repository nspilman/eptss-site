import React from "react";
import queries, { getCurrentRound } from "queries";
import { getNewPhaseManager } from "services/PhaseMgmtService";
import seedrandom from "seedrandom";
import { PageTitle } from "@/components/PageTitle";
import { VotingForm } from "@/components/Voting/VotingForm";
import { FormScaffolding } from "@/components/shared/FormScaffolding";
import { getRoundOverrideVotes } from "@/queries/votingQueries";
import { getUserSession } from "@/components/client/context/getUserSession";
import { Navigation } from "@/enum/navigation";

export interface VoteOptionModel {
  label: string;
  field: string;
  link: string;
}

export interface VoteOptionEntity {
  song: {
    title: string;
    artist: string;
  };
  song_id: number;
  round_id: string;
  youtube_link?: string;
}

const VotingPage = async () => {
  const {
    roundId,
    dateLabels: {
      covering: { opens: coveringStartLabel },
    },
  } = await getNewPhaseManager();
  const { typeOverride } = await getCurrentRound();

  const isVotingOpen = true;
  const unsortedVoteOptions = isVotingOpen
    ? await getVoteOptions(roundId, typeOverride as "runner_up" | undefined)
    : [];

  const voteOptions =
    typeOverride === "runner_up"
      ? unsortedVoteOptions
      : seededShuffle(unsortedVoteOptions, JSON.stringify(unsortedVoteOptions));

  const title = `Vote for the songs you want to cover in Round ${roundId}`;

  const fields = voteOptions.map((option) => ({
    ...option,
    type: "vote" as const,
  }));

  const { phase } = await getNewPhaseManager();
  const { userRoundDetails, user } = await getUserSession();

  const shouldRenderForm =
    phase === "voting" || (roundId === 21 && phase === "signups");

  return (
    <>
      <PageTitle title={title} />
      <FormScaffolding
        userId={user?.id}
        redirectUrl={Navigation.Voting}
        Form={
          <VotingForm
            fields={fields}
            coveringStartsLabel={coveringStartLabel}
            title={title}
            roundId={roundId}
          />
        }
        isLoading={false}
        AlreadyCompleted={
          <h2 className="font-fraunces text-white font-bold text-xl">
            Thanks for Voting!
          </h2>
        }
        FormClosed={
          <h2 className="font-fraunces text-white font-bold text-xl">
            Voting is not open at this time! Check back later
          </h2>
        }
        hasUserCompletedTask={userRoundDetails?.hasVoted || false}
        shouldRenderForm={shouldRenderForm}
      />
    </>
  );
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
    const { data, error } = await getRoundOverrideVotes(roundId);
    //@ts-ignore
    data?.forEach((record) => record.song && resultEntities.push(record));
    if (error) {
      throw new Error(JSON.stringify(error));
    }
  } else {
    const { data, error } = await queries.signups.getSignupsByRound(roundId);
    //@ts-ignore
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
