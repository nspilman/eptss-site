import VotingPageWrapper from "../VotingPageWrapper";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VotingForRound({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <VotingPageWrapper slug={resolvedParams.slug} searchParams={resolvedSearchParams} />;
}
