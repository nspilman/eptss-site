import VotingPageWrapper from "../VotingPageWrapper";

interface Props {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function VotingForRound({ params, searchParams }: Props) {
  return <VotingPageWrapper slug={params.slug} searchParams={searchParams} />;
}
