import { roundProvider, userParticipationProvider } from "@eptss/data-access";
import { submitVotes } from "@eptss/data-access/services/votesService";
import { VotingPage } from "./VotingPage";
import { notFound } from "next/navigation";

interface Props {
  projectId: string;
  slug?: string;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function VotingPageWrapper({ projectId, slug, searchParams }: Props) {
  const roundData = slug ? await roundProvider({ slug, projectId }) : await roundProvider({ projectId });
  const {
    roundId,
    dateLabels: {
      covering: { opens: coveringStartLabel },
    },
    voteOptions,
    phase,
  } = roundData;

  if (!roundId) return notFound();
  if (phase !== "voting") {
    return <div>Round is not in voting phase</div>;
  }

  const { roundDetails, userVotes } = await userParticipationProvider({ roundId });
  const filteredUserVotes = (userVotes ?? [])
    .filter((v: any): v is { songId: number; vote: number } => v.songId != null)
    .map((v: any) => ({ songId: Number(v.songId), vote: Number(v.vote) }));

  const userRoundDetails = roundDetails ? {
    hasSubmitted: roundDetails.hasSubmitted,
    hasVoted: roundDetails.hasVoted,
    hasSignedUp: roundDetails.hasSignedUp
  } : undefined;

  const showUpdateView = searchParams?.update === "true";

  return (
    <VotingPage
      roundId={roundId}
      songs={voteOptions}
      coveringStartLabel={coveringStartLabel}
      userRoundDetails={userRoundDetails}
      userVotes={filteredUserVotes}
      showUpdateView={showUpdateView}
      submitVotes={submitVotes}
    />
  );
}
