import { roundProvider, userParticipationProvider } from "@/providers";
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

  const {roundDetails}  = await userParticipationProvider({
    roundId: roundToReference,
  });

  return (
    <SubmitPage
      roundId={roundToReference}
      hasSubmitted={roundDetails?.hasSubmitted || false}
      song={song}
      dateStrings={{
        coverClosesLabel,
        listeningPartyLabel,
      }}
    />
  );
};

export default Submit;
