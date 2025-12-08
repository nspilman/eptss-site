import React from "react";
import { Metadata } from 'next';
import { getProjectIdFromSlug, type ProjectSlug } from "@eptss/data-access";
import VotingPageWrapper from "./VotingPageWrapper";

export const metadata: Metadata = {
  title: "Vote on Covers | Everyone Plays the Same Song",
  description: "Listen and vote on community-submitted cover versions. Help choose the standout performances in this round of Everyone Plays the Same Song.",
  openGraph: {
    title: "Vote on Covers | Everyone Plays the Same Song",
    description: "Listen and vote on community-submitted cover versions. Help choose the standout performances in this round of Everyone Plays the Same Song.",
  },
};

interface Props {
  params: Promise<{ projectSlug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const VotingPageHome = async ({ params, searchParams }: Props) => {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <VotingPageWrapper projectId={projectId} searchParams={resolvedSearchParams} />;
};

export default VotingPageHome;
