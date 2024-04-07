import { roundProvider } from "@/providers/roundProvider";
import { SignupPage } from "../SignupPage";
import { userParticipationProvider } from "@/providers/userParticipationProvider";

export default async function SignUpForRound({
  params,
}: {
  params: { roundId: string };
}) {
  const { roundId, dateLabels } = await roundProvider(parseInt(params.roundId));

  if (!roundId) {
    return <div>Round not found</div>;
  }

  const { userRoundDetails, userId } = await userParticipationProvider({
    roundId,
  });
  const signupsCloseDateLabel = dateLabels?.signups.closes;

  return (
    <SignupPage
      userId={userId}
      signupsCloseDateLabel={signupsCloseDateLabel}
      roundId={roundId}
      hasSignedUp={userRoundDetails?.hasSignedUp || false}
    />
  );
}
