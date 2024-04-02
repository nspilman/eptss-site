import { getUserSession } from "@/components/client/context/userSessionProvider";
import { roundService } from "@/data-access/roundService";
import { roundManager } from "@/services/roundManager";
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

  const { roundId, dateLabels } = await roundManager(roundDetails);
  const { userRoundDetails } = await getUserSession({ roundId });
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
