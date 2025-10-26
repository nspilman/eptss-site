import { isAdmin } from "@eptss/data-access/utils/isAdmin";
import { notFound } from "next/navigation";
import { Metadata } from 'next/types';
import { Suspense } from "react";
import { RoundSelectorServer } from "./RoundSelectorServer";
import { AdminTabsShell } from "./components/AdminTabsShell";
import { PageTitle } from "./PageTitle";
import { getCurrentRound } from "@eptss/data-access";

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
  searchParams: Promise<{ slug?: string; tab?: string }>;
}) => {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return notFound();
    }

    // Await searchParams
    const resolvedSearchParams = await searchParams;

    // Fetch only the current round for default slug
    const currentRoundResult = await getCurrentRound();
    const currentRound = currentRoundResult.status === 'success' ? currentRoundResult.data : null;
    
    // Use slug from URL, or fall back to current round slug
    const selectedRoundSlug = resolvedSearchParams.slug || currentRound?.slug || "";
    const activeTab = resolvedSearchParams.tab || "overview";

    return (
      <div className="container mx-auto py-8 px-4 space-y-8">
        <PageTitle title="Admin Dashboard" />

        {/* Round Selector with Suspense */}
        <Suspense fallback={
          <div className="h-16 bg-background-secondary/30 animate-pulse rounded" />
        }>
          <RoundSelectorServer currentRoundSlug={selectedRoundSlug} />
        </Suspense>

        {/* Tab shell renders immediately, content streams in */}
        <AdminTabsShell 
          initialTab={activeTab}
          roundSlug={selectedRoundSlug}
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
