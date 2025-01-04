import { roundProvider, userParticipationProvider } from "@/providers";
import VotingPage from "../VotingPage";
import { getAuthUser } from "@/utils/supabase/server";

export default async function VotingForRound({
  params,
}: {
  params: { roundId: string };
}) {
  const {
    roundId,
    dateLabels: {
      covering: { opens: coveringStartLabel },
    },
    voteOptions,
    phase,
  } = await roundProvider(parseInt(params.roundId));

  if (!roundId) {
    return <div>Round not found</div>;
  }

  const { userId } = getAuthUser();
  const { userRoundDetails } = await userParticipationProvider({ roundId });

  return (
    <VotingPage
      roundId={roundId}
      voteOptions={voteOptions}
      phase={phase}
      coveringStartLabel={coveringStartLabel}
      userId={userId}
      userRoundDetails={userRoundDetails}
    />
  );
}
