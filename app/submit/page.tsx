import { roundProvider } from "@/providers/roundProvider";
import { userSessionProvider } from "@/providers/userSessionProvider";
import { roundService } from "@/data-access/roundService";
import { SubmitPage } from "./SubmitPage";

const Submit = async () => {
  const { roundId, phase } = await roundProvider();

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
  } = await roundProvider(round);

  const { userRoundDetails } = await userSessionProvider({
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
