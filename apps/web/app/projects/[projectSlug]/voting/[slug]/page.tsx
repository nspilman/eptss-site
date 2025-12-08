import { getProjectIdFromSlug, type ProjectSlug } from "@eptss/data-access";
import VotingPageWrapper from "../VotingPageWrapper";

interface Props {
  params: Promise<{ projectSlug: string; slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VotingForRound({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const { projectSlug, slug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <VotingPageWrapper projectId={projectId} slug={slug} searchParams={resolvedSearchParams} />;
}
