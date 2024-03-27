import React from "react";
import queries from "@/data-access";
import { roundManager } from "@/services/roundManager";
import seedrandom from "seedrandom";
import { PageTitle } from "@/components/PageTitle";
import { getRoundOverrideVotes } from "@/data-access/votingQueries";
import { getUserSession } from "@/components/client/context/userSessionProvider";
import { ClientFormWrapper } from "@/components/client/Forms/ClientFormWrapper";
import { Form } from "@/components/Form";
import { submitVotes } from "@/actions/actions";
import { roundService } from "@/data-access/roundService";

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
  } = await roundManager();
  const { typeOverride } = await roundService.getCurrentRound();

  const isVotingOpen = true;
  const unsortedVoteOptions = isVotingOpen
    ? await getVoteOptions(20, typeOverride as "runner_up" | undefined)
    : [];

  const voteOptions =
    typeOverride === "runner_up"
      ? unsortedVoteOptions
      : seededShuffle(unsortedVoteOptions, JSON.stringify(unsortedVoteOptions));

  const title = `Vote for the songs you want to cover in Round ${roundId}`;

  const fields = voteOptions.map((option) => ({
    ...option,
    type: "vote" as const,
    defaultValue: undefined,
    placeholder: "",
  }));

  const { phase } = await roundManager();
  const { userRoundDetails } = await getUserSession();

  const shouldRenderForm =
    phase === "voting" || (roundId === 21 && phase === "signups");

  return (
    <>
      <PageTitle title={title} />
      {phase === "voting" ? (
        <ClientFormWrapper action={submitVotes}>
          <Form
            title={title}
            description={`Covering starts ${coveringStartLabel}`}
            formSections={fields.map((field) => ({
              ...field,
              id: field.field,
              defaultValue: field.defaultValue || "",
            }))}
          />
        </ClientFormWrapper>
      ) : (
        <></>
      )}
    </>
  );
};

export default VotingPage;

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
