import { roundProvider, votesProvider, roundsProvider, adminPageProvider } from "@/providers";
import { isAdmin } from "@/utils/isAdmin";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import { RoundSelector } from "./RoundSelector";
import { AdminTabs } from "./components";
import { PageTitle } from "./PageTitle";

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
    if (!(await isAdmin())) {
      return notFound();
    }

    // Await searchParams
    const resolvedSearchParams = await searchParams;

    // Get all admin data in one call (following the architecture pattern)
    const { stats, currentRound, allUsers, activeUsers } = await adminPageProvider();
    const { allRoundSlugs } = await roundsProvider({});

    // Handle case where no rounds exist
    let currentRoundSlug = "";
    let phase = "" as any; // Using 'any' to match the expected Phase type
    let dateLabels = {} as Record<string, { opens: string; closes: string }>;
    let voteOptions: Array<{ roundId: number; songId: number; youtubeLink?: string; song: { title: string; artist: string } }> = [];
    let signups: Array<{ email?: string | null; song: { title: string; artist: string }; songId: number; youtubeLink: string; userId?: string }> = [];
    let submissions: Array<{ roundId: number; soundcloudUrl: string; username: string; createdAt: Date }> = [];
    let roundId = 0;

    if (currentRound) {
      currentRoundSlug = resolvedSearchParams.slug 
        ? resolvedSearchParams.slug
        : currentRound.slug;

      // Get current round data if a round exists
      const roundData = await roundProvider(currentRoundSlug);
      phase = roundData.phase;
      dateLabels = roundData.dateLabels;
      voteOptions = roundData.voteOptions;
      signups = roundData.signups;
      submissions = roundData.submissions;
      roundId = roundData.roundId;
    } else if (allRoundSlugs && allRoundSlugs.length > 0 && resolvedSearchParams.slug) {
      // If no current round but we have a slug in params, use that
      currentRoundSlug = resolvedSearchParams.slug;
      const roundData = await roundProvider(currentRoundSlug);
      phase = roundData.phase;
      dateLabels = roundData.dateLabels;
      voteOptions = roundData.voteOptions;
      signups = roundData.signups;
      submissions = roundData.submissions;
      roundId = roundData.roundId;
    }
    // If no rounds exist at all, we'll use the default empty values

    // Default values for votes data
    let voteResults: Array<{ title: string; artist: string; average: number; votesCount: number }> = [];
    let outstandingVoters: string[] = [];
    
    // Only fetch votes if we have a valid round
    if (currentRoundSlug) {
      const votesData = await votesProvider({ roundSlug: currentRoundSlug });
      voteResults = votesData.voteResults || [];
      outstandingVoters = votesData.outstandingVoters || [];
    }

    // Default to reports tab if none specified
    const activeTab = resolvedSearchParams.tab || "reports";

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
          roundId={roundId}
          roundSlug={currentRoundSlug}
          users={allUsers}
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
