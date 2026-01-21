import { roundProvider, getProjectIdFromSlug, isValidProjectSlug, type ProjectSlug } from "@eptss/data-access";
import { getPageContent } from "@eptss/project-config";
import { Metadata } from 'next';
import { SuccessPage } from "./SuccessPage";

interface Props {
  params: Promise<{ projectSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;

  if (!isValidProjectSlug(projectSlug)) {
    return {
      title: "Submission Success",
    };
  }

  return {
    title: "Submission Success",
    description: "Your submission has been received!",
  };
}

export const dynamic = 'force-dynamic';

const Success = async ({ params }: Props) => {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;

  if (!isValidProjectSlug(projectSlug)) {
    return <div>Project not found</div>;
  }

  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);
  const submitContent = await getPageContent(projectSlug as ProjectSlug, 'submit');

  const {
    dateLabels: {
      celebration: { closes: listeningPartyLabel },
    },
  } = await roundProvider({ projectId });

  return (
    <SuccessPage
      projectSlug={projectSlug}
      listeningPartyLabel={listeningPartyLabel}
      successMessage={submitContent.successMessage}
    />
  );
};

export default Success;
