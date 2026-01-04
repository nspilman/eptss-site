import { Suspense } from "react";
import { DataTable } from "@eptss/ui";
import { roundProvider, votesProvider, COVER_PROJECT_ID } from "@eptss/data-access";
import { routes } from "@eptss/routing";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SignupsCard, SubmissionsCard, AdminSection } from "@eptss/admin";

async function RoundDetailContent({ slug, projectId }: { slug: string; projectId: string }) {
  const { dateLabels, voteOptions, signups, submissions, phase, roundId } = await roundProvider({ slug, projectId });
  const { voteResults, outstandingVoters } = await votesProvider({ projectId, roundSlug: slug });

  const voteResultsHeaderKeys = ["title", "artist", "average", "votesCount"] as const;
  const voteHeaders = voteResultsHeaderKeys.map(key => ({
    key: key, label: key, sortable: true
  }));

  const datesArray = Object.entries(dateLabels)?.map(([key, { opens, closes }]) => ({
    phase: key,
    opens: new Date(opens).toLocaleString(),
    closes: new Date(closes).toLocaleString()
  }));
  const dateHeaders = [
    { key: 'phase', label: 'Phase', sortable: true },
    { key: 'opens', label: 'Opens', sortable: true },
    { key: 'closes', label: 'Closes', sortable: true }
  ];

  const voteOptionsArray = voteOptions.map((option) => ({
    label: `${option.song.title} - ${option.song.artist}`,
    link: option.youtubeLink || ''
  }));
  const voteOptionHeaders = [
    { key: 'label', label: 'Label', sortable: true },
    { key: 'link', label: 'Link', sortable: true }
  ];

  const outstandingVotesHeader = [
    { key: "email", label: "Email", sortable: true }
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div>
        <Link
          href={routes.admin.rounds.list({ query: { projectId } })}
          className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rounds
        </Link>
        <h2 className="text-3xl font-bold text-primary mb-2">{slug}</h2>
        <p className="text-secondary">
          Current Phase: <span className="text-primary font-medium">{phase}</span>
        </p>
      </div>

      <div className="w-full max-w-full">
        <SignupsCard signups={signups} />
        <SubmissionsCard submissions={submissions} />
      </div>

      <AdminSection title="Round Schedule" titleSize="md">
        <DataTable rows={datesArray} headers={dateHeaders} allowCopy={true} />
      </AdminSection>

      <AdminSection title="Vote Options" titleSize="md">
        <DataTable rows={voteOptionsArray} headers={voteOptionHeaders} allowCopy={true} />
      </AdminSection>

      <AdminSection title="Outstanding Voters" titleSize="md">
        {outstandingVoters.length === 0 ? (
          <p className="text-secondary text-center py-4">All votes are in!</p>
        ) : (
          <DataTable rows={outstandingVoters.map(email => ({ email: email || '' }))} headers={outstandingVotesHeader} allowCopy={true} />
        )}
      </AdminSection>

      <AdminSection title="Vote Results" titleSize="md">
        {voteResults.length === 0 ? (
          <p className="text-secondary text-center py-4">No votes yet</p>
        ) : (
          <DataTable rows={voteResults} headers={voteHeaders} allowCopy={true} />
        )}
      </AdminSection>
    </div>
  );
}

export default async function AdminRoundPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ projectId?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slugParam = resolvedParams.slug;
  const projectId = resolvedSearchParams.projectId || COVER_PROJECT_ID;

  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-12 bg-background-secondary/30 animate-pulse rounded" /></div>}>
      <RoundDetailContent slug={slugParam} projectId={projectId} />
    </Suspense>
  );
}
