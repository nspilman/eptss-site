import { DataTable } from "@/components/DataTable";
import { roundProvider, votesProvider, roundsProvider, adminProvider } from "@/providers";
import { isAdmin } from "@/utils/isAdmin";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import { RoundScheduleCard } from "./RoundScheduleCard";
import { SignupsCard } from "./SignupsCard";
import { SubmissionsCard } from "./SubmissionCard";
import { VotingCard } from "./VotingCard";
import { ProjectStatsCard } from "./ProjectStatsCard";
import { RoundSelector } from "./RoundSelector";
import { AdminSignupForm } from "./AdminSignupForm";
import { AdminSubmissionForm } from "./AdminSubmissionForm";
import { getCurrentRound, getAllUsers } from "@/data-access";

export const metadata: Metadata = {
  title: "Admin Dashboard | Everyone Plays the Same Song",
  description: "Administrative dashboard for managing Everyone Plays the Same Song rounds, participants, and submissions.",
  openGraph: {
    title: "Admin Dashboard | Everyone Plays the Same Song",
    description: "Administrative dashboard for managing Everyone Plays the Same Song rounds, participants, and submissions.",
  },
};

const AdminPage = async ({
  searchParams,
}: {
  searchParams: { slug: string };
}) => {
  if (!(await isAdmin())) {
    return notFound();
  }

  // Get all rounds for the selector
  const { allRoundSlugs } = await roundsProvider({});
  const currentRound = await getCurrentRound()

  if (!currentRound.data) {
    return notFound();
  }
  
  const currentRoundSlug = searchParams.slug 
    ? searchParams.slug
    : currentRound.data.slug;

  // Get current round data
  const { phase, dateLabels, voteOptions, signups, submissions, roundId } = 
    await roundProvider(currentRoundSlug);


  const { voteResults, outstandingVoters } = 
    await votesProvider({ roundSlug: currentRoundSlug });
  const stats = await adminProvider();
  
  // Get all users for the signup form
  const users = await getAllUsers();

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Project Overview Section */}
      <section>
        <ProjectStatsCard 
          totalUsers={stats.totalUsers}
          totalRounds={stats.totalRounds}
          activeUsers={stats.activeUsers}
          completionRate={stats.completionRate}
        />
      </section>

      {/* Round Selector */}
      <RoundSelector currentRoundSlug={currentRoundSlug} allRoundSlugs={allRoundSlugs} />

      {/* Admin Tools Section */}
      <section className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-4 space-y-4">
        <h2 className="text-xl font-semibold text-primary mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <AdminSignupForm roundId={roundId} users={users} />
          </div>
          <div>
            <AdminSubmissionForm roundId={roundId} users={users} />
          </div>
        </div>
      </section>

      {/* Round Details Section */}
      <section className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-4 space-y-4">
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
    </div>
  );
};

export default AdminPage;
