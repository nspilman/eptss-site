import { roundProvider, userParticipationProvider } from "@/providers";
import { SubmitPage } from "../SubmitPage";

export default async function SignUpForRound({
  params,
}: {
  params: Promise<{ roundId: string }>;
}) {
  const resolvedParams = await params;
  const roundId = JSON.parse(resolvedParams.roundId);
  const {
    dateLabels: {
      covering: { closes: coverClosesLabel },
      celebration: { closes: listeningPartyLabel },
    },
    song,
  } = await roundProvider(roundId);

  const {roundDetails} = await userParticipationProvider({
    roundId,
  });

  return (
    <SubmitPage
      dateStrings={{ listeningPartyLabel, coverClosesLabel }}
      roundId={roundId}
      hasSubmitted={roundDetails?.hasSubmitted || false}
      song={song}
    />
  );
}
