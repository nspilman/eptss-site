import { roundProvider, userParticipationProvider, getProjectIdFromSlug, type ProjectSlug, getUserSubmissionForRound } from "@eptss/core";
import { submitCover } from "@/actions/userParticipationActions";
import { SubmitPage } from "../SubmitPage";
import { getProjectConfig } from "@eptss/project-config";

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

  const projectConfig = await getProjectConfig(projectSlug as ProjectSlug);

  // Fetch existing submission for pre-populating the form
  const existingSubmission = await getUserSubmissionForRound(roundId);

  return (
    <SubmitPage
      projectSlug={projectSlug}
      dateStrings={{ listeningPartyLabel, coverClosesLabel }}
      roundId={roundId}
      hasSubmitted={roundDetails?.hasSubmitted || false}
      existingSubmission={existingSubmission}
      song={song}
      submitCover={submitCover}
      submitContent={projectConfig.content.pages.submit}
      submissionFormConfig={projectConfig.submissionForm}
    />
  );
}
