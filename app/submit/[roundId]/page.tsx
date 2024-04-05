import { userSessionProvider } from "@/providers/userSessionProvider";
import { roundService } from "@/data-access/roundService";
import { roundProvider } from "@/providers/roundProvider";
import { SubmitPage } from "../SubmitPage";

export default async function SignUpForRound({
  params,
}: {
  params: { roundId: string };
}) {
  const roundId = JSON.parse(params.roundId);
  const round = await roundService.getRoundById(JSON.parse(roundId));
  const {
    dateLabels: {
      covering: { closes: coverClosesLabel },
      celebration: { closes: listeningPartyLabel },
    },
    song,
  } = await roundProvider(round);

  const { userRoundDetails } = await userSessionProvider({
    roundId,
  });
  const userId = userRoundDetails?.user.userid || "";

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
