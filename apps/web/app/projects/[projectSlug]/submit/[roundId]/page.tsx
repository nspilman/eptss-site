import { roundProvider, userParticipationProvider, getProjectIdFromSlug, type ProjectSlug } from "@eptss/data-access";
import { submitCover } from "@/actions/userParticipationActions";
import { SubmitPage } from "../SubmitPage";

// Force dynamic rendering since this page requires user authentication
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ projectSlug: string; roundId: string }>;
}

export default async function SubmitForRound({ params }: Props) {
  const resolvedParams = await params;
  const { projectSlug, roundId: roundIdParam } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);
  const roundId = JSON.parse(roundIdParam);

  const {
    dateLabels: {
      covering: { closes: coverClosesLabel },
      celebration: { closes: listeningPartyLabel },
    },
    song,
  } = await roundProvider({ slug: roundId, projectId });

  const {roundDetails} = await userParticipationProvider({
    roundId,
  });

  return (
    <SubmitPage
      dateStrings={{ listeningPartyLabel, coverClosesLabel }}
      roundId={roundId}
      hasSubmitted={roundDetails?.hasSubmitted || false}
      song={song}
      submitCover={submitCover}
    />
  );
}
