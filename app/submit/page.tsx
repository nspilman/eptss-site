import { roundProvider, userParticipationProvider } from "@/providers";
import { SubmitPage } from "./SubmitPage";
import { Metadata } from 'next';
import { getRoundBySlug } from "@/data-access";

export const metadata: Metadata = {
  title: "Submit Your Cover | Everyone Plays the Same Song",
  description: "Submit your unique cover version for the current round of Everyone Plays the Same Song. Share your musical interpretation with our community.",
  openGraph: {
    title: "Submit Your Cover | Everyone Plays the Same Song",
    description: "Submit your unique cover version for the current round of Everyone Plays the Same Song. Share your musical interpretation with our community.",
  },
};

const Submit = async () => {
  const { slug } = await roundProvider();

  const {
    dateLabels: {
      covering: { closes: coverClosesLabel },
      celebration: { closes: listeningPartyLabel },
    },
    song,
  } = await roundProvider(slug);

  const {data: round} = await getRoundBySlug(slug);

  if (!round?.roundId) {
    return <div>Round not found</div>;
  }
  
  const {roundDetails}  = await userParticipationProvider({
    roundId: round.roundId,
  });

  return (
    <SubmitPage
      roundId={round.roundId}
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
