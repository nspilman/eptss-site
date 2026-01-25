import { roundProvider, userParticipationProvider, getProjectIdFromSlug, isValidProjectSlug, type ProjectSlug, getUserSubmissionForRound } from "@eptss/core";
import { getProjectSEOMetadata, getPageContent, getProjectConfig } from "@eptss/project-config";
import { submitCover } from "@/actions/userParticipationActions";
import { SubmitPage } from "./SubmitPage";
import { Metadata } from 'next';

interface Props {
  params: Promise<{ projectSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;

  // Validate slug
  if (!isValidProjectSlug(projectSlug)) {
    return {
      title: "Submit | Project Not Found",
      description: "The requested project could not be found",
    };
  }

  // Get SEO metadata from config
  const seoMetadata = await getProjectSEOMetadata(projectSlug as ProjectSlug);
  const { submitPage } = seoMetadata;

  return {
    title: submitPage.title,
    description: submitPage.description,
    openGraph: {
      title: submitPage.ogTitle || submitPage.title,
      description: submitPage.ogDescription || submitPage.description,
    },
  };
}

// Force dynamic rendering since this page requires user authentication
export const dynamic = 'force-dynamic';

const Submit = async ({ params }: Props) => {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  // Get submit page content from config
  const submitContent = await getPageContent(projectSlug as ProjectSlug, 'submit');

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

  const projectConfig = await getProjectConfig(projectSlug as ProjectSlug);

  // Fetch existing submission for pre-populating the form
  const existingSubmission = await getUserSubmissionForRound(roundId);

  return (
    <SubmitPage
      projectSlug={projectSlug}
      roundId={roundId}
      hasSubmitted={roundDetails?.hasSubmitted || false}
      existingSubmission={existingSubmission}
      song={song}
      dateStrings={{
        coverClosesLabel,
        listeningPartyLabel,
      }}
      submitCover={submitCover}
      submitContent={submitContent}
      submissionFormConfig={projectConfig.submissionForm}
    />
  );
};

export default Submit;
