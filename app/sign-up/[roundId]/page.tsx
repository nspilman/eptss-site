import { userSessionProvider } from "@/providers/userSessionProvider";
import { roundService } from "@/data-access/roundService";
import { roundProvider } from "@/providers/roundProvider";
import { SignupPage } from "../SignupPage";

export default async function SignUpForRound({
  params,
}: {
  params: { roundId: string };
}) {
  const roundDetails = await roundService.getRoundById(
    parseInt(params.roundId)
  );

  if (!roundDetails) {
    return <div>Round not found</div>;
  }

  const { roundId, dateLabels } = await roundProvider(roundDetails);
  const { userRoundDetails } = await userSessionProvider({ roundId });
  const userId = userRoundDetails?.user.userid || "";
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
