import { roundProvider } from "@/providers/roundProvider";
import { userSessionProvider } from "@/providers/userSessionProvider";
import { SubmitPage } from "./SubmitPage";

const Submit = async () => {
  const { roundId, phase } = await roundProvider();

  const roundToReference = ["celebration", "covering"].includes(phase)
    ? roundId
    : roundId - 1;

  const {
    dateLabels: {
      covering: { closes: coverClosesLabel },
      celebration: { closes: listeningPartyLabel },
    },
    song,
  } = await roundProvider(roundToReference);

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
