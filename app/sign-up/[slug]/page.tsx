import { roundProvider, userParticipationProvider } from "@/providers";
import { SignupPage } from "../SignupPage/SignupPage";

export default async function SignUpForRound({
  params,
}: {
  params: { slug: string };
}) {
  const { roundId, dateLabels } = await roundProvider(params.slug);

  if (!roundId) {
    return <div>Round not found</div>;
  }

  const { roundDetails } = await userParticipationProvider({
    roundId,
  });
  const signupsCloseDateLabel = dateLabels?.signups.closes;

  return (
    <SignupPage
      signupsCloseDateLabel={signupsCloseDateLabel}
      roundId={roundId}
      slug={params.slug}
      hasSignedUp={roundDetails?.hasSignedUp || false}
    />
  );
}
