import { getProjectIdFromSlug, type ProjectSlug } from "@eptss/data-access";
import { SharedSignupPageWrapper } from "../SharedSignupPageWrapper";

interface Props {
  params: Promise<{ projectSlug: string; slug: string }>;
}

export default async function SignUpForRound({ params }: Props) {
  const resolvedParams = await params;
  const { projectSlug, slug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  return (
    <SharedSignupPageWrapper
      projectId={projectId}
      projectSlug={projectSlug}
      slug={slug}
    />
  );
}
