import { roundProvider } from "@/providers/roundProvider";
import { SubmitPage } from "../SubmitPage";
import { userParticipationProvider } from "@/providers/userParticipationProvider";

export default async function SignUpForRound({
  params,
}: {
  params: { roundId: string };
}) {
  const roundId = JSON.parse(params.roundId);
  const {
    dateLabels: {
      covering: { closes: coverClosesLabel },
      celebration: { closes: listeningPartyLabel },
    },
    song,
  } = await roundProvider(roundId);

  const { userRoundDetails, userId } = await userParticipationProvider({
    roundId,
  });

  return (
    <SubmitPage
      userId={userId}
      dateStrings={{ listeningPartyLabel, coverClosesLabel }}
      roundId={roundId}
      hasSubmitted={userRoundDetails?.hasSubmitted || false}
      song={song}
    />
  );
}
