"use client";

import { motion } from "framer-motion";
import { ProjectStatsCard } from "../ProjectStatsCard";
import { ActiveUsersCard } from "../ActiveUsersCard";
import { RoundScheduleCard } from "../RoundScheduleCard";
import { SignupsCard } from "../SignupsCard";
import { SubmissionsCard } from "../SubmissionCard";
import { VotingCard } from "../VotingCard";
import { Phase, DateLabel, Submission } from "@/types/round";
import { ActiveUserDetail } from "@/providers/adminProvider/adminProvider";
import { VoteOption } from "@/types/vote";
import { SignupData } from "@/types/signup";

type VoteResult = {
  title: string;
  artist: string;
  average: number;
  votesCount: number;
};

type ReportsTabProps = {
  stats: {
    totalUsers: number;
    totalRounds: number;
    activeUsers: number;
    completionRate: number;
  };
  activeUsers: ActiveUserDetail[];
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
};

export function ReportsTab({
  stats,
  activeUsers,
  phase,
  dateLabels,
  signups,
  submissions,
  voteOptions,
  outstandingVoters,
  voteResults,
}: ReportsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Project Overview Section */}
      <section>
        <ProjectStatsCard 
          totalUsers={stats.totalUsers}
          totalRounds={stats.totalRounds}
          activeUsers={stats.activeUsers}
          completionRate={stats.completionRate}
        />
      </section>
      
      {/* Active Users Section */}
      <section>
        <ActiveUsersCard users={activeUsers} />
      </section>

      {/* Round Details Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4 space-y-4">
        {/* Schedule Card - Full Width */}
        <RoundScheduleCard phase={phase} dateLabels={dateLabels} />
        
        {/* Signups Row */}
        <div className="w-full">
          <SignupsCard signups={signups} />
        </div>

        {/* Voting Row */}
        <div className="w-full">
          <VotingCard
            voteOptions={voteOptions}
            outstandingVoters={outstandingVoters}
            voteResults={voteResults}
          />
        </div>

        {/* Submissions Row */}
        <div className="w-full">
          <SubmissionsCard submissions={submissions} />
        </div>
      </section>
    </motion.div>
  );
}
