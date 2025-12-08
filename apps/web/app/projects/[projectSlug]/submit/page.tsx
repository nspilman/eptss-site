import { roundProvider, userParticipationProvider, getProjectIdFromSlug, type ProjectSlug } from "@eptss/data-access";
import { submitCover } from "@/actions/userParticipationActions";
import { SubmitPage } from "./SubmitPage";
import { Metadata } from 'next';

interface Props {
  params: Promise<{ projectSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;

  if (projectSlug === 'monthly-original') {
    return {
      title: "Submit Your Original Song | Monthly Original Challenge",
      description: "Submit your original song for the current monthly challenge. Share your creative work with our songwriting community.",
      openGraph: {
        title: "Submit Your Original Song | Monthly Original Challenge",
        description: "Submit your original song for the current monthly challenge. Share your creative work with our songwriting community.",
      },
    };
  }

  return {
    title: "Submit Your Cover | Everyone Plays the Same Song",
    description: "Submit your unique cover version for the current round of Everyone Plays the Same Song. Share your musical interpretation with our community.",
    openGraph: {
      title: "Submit Your Cover | Everyone Plays the Same Song",
      description: "Submit your unique cover version for the current round of Everyone Plays the Same Song. Share your musical interpretation with our community.",
    },
  };
}

// Force dynamic rendering since this page requires user authentication
export const dynamic = 'force-dynamic';

const Submit = async ({ params }: Props) => {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  const {
    roundId,
    slug,
    dateLabels: {
      covering: { closes: coverClosesLabel },
      celebration: { closes: listeningPartyLabel },
    },
    song,
  } = await roundProvider({ projectId });

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
