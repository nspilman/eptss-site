import { roundProvider, userParticipationProvider } from "@/providers";
import { SubmitPage } from "./SubmitPage";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Submit Your Cover | Everyone Plays the Same Song",
  description: "Submit your unique cover version for the current round of Everyone Plays the Same Song. Share your musical interpretation with our community.",
  openGraph: {
    title: "Submit Your Cover | Everyone Plays the Same Song",
    description: "Submit your unique cover version for the current round of Everyone Plays the Same Song. Share your musical interpretation with our community.",
  },
};

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
