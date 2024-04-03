import { getUserSession } from "@/components/client/context/userSessionProvider";
import { roundService } from "@/data-access/roundService";
import { roundManager } from "@/services/roundManager";
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
  } = await roundManager(round);

  const { userRoundDetails } = await getUserSession({
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
