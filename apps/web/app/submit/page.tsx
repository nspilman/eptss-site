import { roundProvider, userParticipationProvider } from "@eptss/data-access";
import { submitCover } from "@/actions/userParticipationActions";
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

// Force dynamic rendering since this page requires user authentication
export const dynamic = 'force-dynamic';

const Submit = async () => {
  const {
    roundId,
    slug,
    dateLabels: {
      covering: { closes: coverClosesLabel },
      celebration: { closes: listeningPartyLabel },
    },
    song,
  } = await roundProvider({});

  if (!roundId) {
    return <div>Round not found</div>;
  }
  
  const {roundDetails}  = await userParticipationProvider({
    roundId,
  });

  return (
    <SubmitPage
      roundId={roundId}
      hasSubmitted={roundDetails?.hasSubmitted || false}
      song={song}
      dateStrings={{
        coverClosesLabel,
        listeningPartyLabel,
      }}
      submitCover={submitCover}
    />
  );
};

export default Submit;
