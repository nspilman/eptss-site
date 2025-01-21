import { roundProvider, userParticipationProvider } from "@/providers";
import { SignupPage } from "../SignupPage";

export default async function SignUpForRound({
  params,
}: {
  params: { roundId: string };
}) {
  const { roundId, dateLabels } = await roundProvider(parseInt(params.roundId));

  if (!roundId) {
    return <div>Round not found</div>;
  }

  const {roundDetails}  = await userParticipationProvider({
    roundId,
  });
  const signupsCloseDateLabel = dateLabels?.signups.closes;

  return (
    <SignupPage
      signupsCloseDateLabel={signupsCloseDateLabel}
      roundId={roundId}
      hasSignedUp={roundDetails?.hasSignedUp || false}
    />
  );
}
