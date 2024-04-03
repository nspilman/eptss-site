import { roundManager } from "@/services/roundManager";
import { getUserSession } from "@/components/client/context/userSessionProvider";
import { roundService } from "@/data-access/roundService";
import { SubmitPage } from "./SubmitPage";

const Submit = async () => {
  const { roundId, phase } = await roundManager();

  const roundToReference = ["celebration", "covering"].includes(phase)
    ? roundId
    : roundId - 1;

  const round = await roundService.getRoundById(roundToReference);
  const {
    dateLabels: {
      covering: { closes: coverClosesLabel },
      celebration: { closes: listeningPartyLabel },
    },
    song,
  } = await roundManager(round);

  const { userRoundDetails } = await getUserSession({
    roundId: roundToReference,
  });
  const userId = userRoundDetails?.user.userid || "";

  return (
    <SubmitPage
      userId={userId}
      roundId={roundToReference}
      hasSubmitted={userRoundDetails?.hasSubmitted || false}
      song={song}
      dateStrings={{
        coverClosesLabel,
        listeningPartyLabel,
      }}
    />
  );
};

export default Submit;
