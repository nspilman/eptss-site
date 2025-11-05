"use client";

import { motion } from "framer-motion";
import { RoundScheduleCard } from "./RoundScheduleCard";
import { SignupsCard } from "./SignupsCard";
import { SubmissionsCard } from "./SubmissionCard";
import { VotingCard } from "./VotingCard";
import { Phase, DateLabel, Submission } from "@eptss/data-access/types/round";
import { VoteOption } from "@eptss/data-access/types/vote";
import { SignupData } from "@eptss/data-access/types/signup";

type VoteResult = {
  title: string;
  artist: string;
  average: number;
  votesCount: number;
};

type IndividualVote = {
  email: string | null;
  userId: string | null;
  songId: number | null;
  vote: number;
  createdAt: Date | null;
  title: string | null;
  artist: string | null;
};

type ReportsTabProps = {
  stats: {
    totalUsers: number;
    totalRounds: number;
    activeUsers: number;
    completionRate: number;
  };
  phase: Phase;
  dateLabels: Record<Phase, DateLabel>;
  signups: Array<Pick<SignupData, 'songId' | 'youtubeLink' | 'song' | 'additionalComments'> & {
    userId?: string;
    email?: string | null;
  }>;
  submissions: Submission[];
  voteOptions: VoteOption[];
  outstandingVoters: string[];
  voteResults: VoteResult[];
  allVotes: IndividualVote[];
};

export function ReportsTab({
  stats,
  phase,
  dateLabels,
  signups,
  submissions,
  voteOptions,
  outstandingVoters,
  voteResults,
  allVotes,
}: ReportsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Schedule Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">Schedule</h2>
        <RoundScheduleCard phase={phase} dateLabels={dateLabels} />
      </section>
      
      {/* Signups Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">Signups</h2>
        <SignupsCard signups={signups} />
      </section>

      {/* Voting Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">Voting</h2>
        <VotingCard
          voteOptions={voteOptions}
          outstandingVoters={outstandingVoters}
          voteResults={voteResults}
          allVotes={allVotes}
        />
      </section>

      {/* Submissions Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">Submissions</h2>
        <SubmissionsCard submissions={submissions} />
      </section>
    </motion.div>
  );
}
