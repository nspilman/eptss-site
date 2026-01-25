import { getProjectIdFromSlug, type ProjectSlug, getProjectBySlug } from "@eptss/core";
import { SharedSignupPageWrapper } from "../SharedSignupPageWrapper";
import { getProjectSEOMetadata } from "@eptss/project-config";
import { Metadata } from "next";

interface Props {
  params: Promise<{ projectSlug: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { projectSlug, slug } = resolvedParams;

  // Get project info
  const project = await getProjectBySlug(projectSlug);
  const projectName = project?.name || "EPTSS";

  // Get SEO metadata from project config
  const seoMetadata = await getProjectSEOMetadata(projectSlug as ProjectSlug);
  const signupPageMeta = seoMetadata.signupPage;

  // Build the title and description with project and round context
  const title = signupPageMeta.ogTitle || `${signupPageMeta.title} - ${slug} | ${projectName}`;
  const description = signupPageMeta.ogDescription || `${signupPageMeta.description} for ${projectName} - ${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
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
