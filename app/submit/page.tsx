import { roundProvider } from "@/providers/roundProvider";
import { SubmitPage } from "./SubmitPage";
import { userParticipationProvider } from "@/providers/userParticipationProvider";

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

  const { userRoundDetails, userId } = await userParticipationProvider({
    roundId: roundToReference,
  });

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
