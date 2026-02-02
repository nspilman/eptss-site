"use client";

import { useUserParticipation } from "./UserParticipationContext";
import { VotingAveragesTable } from "./VotingAveragesTable";
import { SignupsTable } from "./SignupsTable";
import { VoteResults } from "../types";

const voteResultsHeaders = [
  { key: "title", label: "Title" },
  { key: "artist", label: "Artist" },
  { key: "average", label: "Average" },
] as const;

const signupsHeaders = [
  { key: "title", label: "Title" },
  { key: "artist", label: "Artist" },
  { key: "youtubeLink", label: "Youtube Link" },
] as const;

interface Props {
  voteResults: VoteResults[];
  outstandingVoters: string[];
  signupDataDisplay: {
    youtubeLink: string;
    title: string;
    artist: string;
  }[];
}

export function VotingPhaseContent({ voteResults, outstandingVoters, signupDataDisplay }: Props) {
  const { hasVoted, isLoading } = useUserParticipation();

  // Show a loading skeleton while fetching user state
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-700/50 rounded-lg"></div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <VotingAveragesTable
        voteResults={voteResults}
        outstandingVoters={outstandingVoters}
        voteResultsHeaders={voteResultsHeaders}
      />
    );
  }

  return <SignupsTable signupsHeaders={signupsHeaders} signupDataDisplay={signupDataDisplay} />;
}
