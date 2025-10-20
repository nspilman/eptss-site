import { roundProvider, votesProvider, roundsProvider, adminPageProvider } from "@/providers";
import { isAdmin } from "@/utils/isAdmin";
import { notFound } from "next/navigation";
import { Metadata } from 'next/types';
import { RoundSelector } from "./RoundSelector";
import { AdminTabs } from "./components";
import { PageTitle } from "./PageTitle";
import { getAllFeedback } from "@/data-access/feedbackService";

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
  searchParams: Promise<{ slug: string; tab?: string }>;
}) => {
  try {
    const adminCheck = await isAdmin();
    console.log("Admin check result:", adminCheck);
    if (!adminCheck) {
      console.log("User is not admin, returning notFound");
      return notFound();
    }
    console.log("User is admin, proceeding");

    // Await searchParams
    const resolvedSearchParams = await searchParams;

    // OPTIMIZED: Fetch all data in parallel instead of sequentially
    console.time('Admin page - initial data fetch');
    const [adminData, roundsData, feedbackResult] = await Promise.all([
      adminPageProvider(),
      roundsProvider({}),
      getAllFeedback(100, 0),
    ]);
    console.timeEnd('Admin page - initial data fetch');

    const { stats, currentRound, allUsers, activeUsers } = adminData;
    const { allRoundSlugs } = roundsData;
    const feedbackList = feedbackResult.status === 'success' ? feedbackResult.data : [];

    // Handle case where no rounds exist
    let currentRoundSlug = "";
    let phase = "" as any; // Using 'any' to match the expected Phase type
    let dateLabels = {} as Record<string, { opens: string; closes: string }>;
    let voteOptions: Array<{ roundId: number; songId: number; youtubeLink?: string; song: { title: string; artist: string } }> = [];
    let signups: Array<{ email?: string | null; song: { title: string; artist: string }; songId: number; youtubeLink: string; userId?: string }> = [];
    let submissions: Array<{ roundId: number; soundcloudUrl: string; username: string; createdAt: Date }> = [];
    let roundId = 0;
    let voteResults: Array<{ title: string; artist: string; average: number; votesCount: number }> = [];
    let outstandingVoters: string[] = [];
    let allVotes: Array<{ email: string | null; userId: string | null; songId: number | null; vote: number; createdAt: Date | null; title: string | null; artist: string | null }> = [];

    if (currentRound) {
      currentRoundSlug = resolvedSearchParams.slug 
        ? resolvedSearchParams.slug
        : currentRound.slug;
    } else if (allRoundSlugs && allRoundSlugs.length > 0 && resolvedSearchParams.slug) {
      currentRoundSlug = resolvedSearchParams.slug;
    }

    // OPTIMIZED: Fetch round and votes data in parallel if we have a round slug
    if (currentRoundSlug) {
      console.time('Admin page - round data fetch');
      const [roundData, votesData] = await Promise.all([
        roundProvider(currentRoundSlug),
        votesProvider({ roundSlug: currentRoundSlug }),
      ]);
      console.timeEnd('Admin page - round data fetch');

      phase = roundData.phase;
      dateLabels = roundData.dateLabels;
      voteOptions = roundData.voteOptions;
      signups = roundData.signups;
      submissions = roundData.submissions;
      roundId = roundData.roundId;
      voteResults = votesData.voteResults || [];
      outstandingVoters = votesData.outstandingVoters || [];
      allVotes = votesData.allVotes || [];
    }

    // Default to overview tab if none specified
    const activeTab = resolvedSearchParams.tab || "overview";

    return (
      <div className="container mx-auto py-8 px-4 space-y-8">
        <PageTitle title="Admin Dashboard" />

        {/* Round Selector */}
        <RoundSelector currentRoundSlug={currentRoundSlug} allRoundSlugs={allRoundSlugs} />

        {/* Admin Tabs Component */}
        <AdminTabs
          initialTab={activeTab}
          stats={stats}
          activeUsers={activeUsers}
          phase={phase}
          dateLabels={dateLabels}
          signups={signups}
          submissions={submissions}
          voteOptions={voteOptions}
          outstandingVoters={outstandingVoters}
          voteResults={voteResults}
          allVotes={allVotes}
          roundId={roundId}
          roundSlug={currentRoundSlug}
          users={allUsers}
          allRoundSlugs={allRoundSlugs}
          feedbackList={feedbackList}
        />
      </div>
    );
  } catch (error) {
    console.error("Error in admin page:", error);
    return (
      <div className="container mx-auto py-8 px-4 space-y-8">
        <PageTitle title="Admin Dashboard" />
        <div className="bg-background-secondary/50 p-6 rounded-lg border border-background-tertiary/50">
          <h2 className="text-xl font-semibold text-primary mb-4">Database Connection Error</h2>
          <p className="text-primary mb-4">There was an error connecting to the database. This might be due to incorrect credentials in your .env.local file.</p>
          <div className="bg-background-primary p-4 rounded border border-background-tertiary/50 overflow-auto">
            <pre className="text-primary whitespace-pre-wrap">{(error as Error).message}</pre>
          </div>
          <p className="text-primary mt-4">Please check your database connection settings in .env.local and try again.</p>
        </div>
      </div>
    );
  }
};

export default AdminPage;
