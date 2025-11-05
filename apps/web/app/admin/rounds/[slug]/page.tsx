import { Suspense } from "react";
import { DataTable } from "@eptss/ui";
import { roundProvider, votesProvider } from "@eptss/data-access";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SignupsCard, SubmissionsCard } from "@eptss/admin";

async function RoundDetailContent({ slug }: { slug: string }) {
  const { dateLabels, voteOptions, signups, submissions, phase, roundId } = await roundProvider(slug);
  const { voteResults, outstandingVoters } = await votesProvider({ roundSlug: slug });

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
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/rounds"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
          <SignupsCard signups={signups} />
        </div>
        <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
          <SubmissionsCard submissions={submissions} />
        </div>
        <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
          <h4 className="text-sm font-medium text-secondary mb-2">Voting</h4>
          <p className="text-2xl font-bold text-primary">{voteResults.length}</p>
          <p className="text-sm text-secondary mt-1">Total votes</p>
          <p className="text-sm text-secondary mt-2">Outstanding: {outstandingVoters.length}</p>
        </div>
      </div>

      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Round Schedule</h3>
        <DataTable rows={datesArray} headers={dateHeaders} allowCopy={true} />
      </div>

      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Vote Options</h3>
        <DataTable rows={voteOptionsArray} headers={voteOptionHeaders} allowCopy={true} />
      </div>

      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Outstanding Voters</h3>
        {outstandingVoters.length === 0 ? (
          <p className="text-secondary text-center py-4">All votes are in!</p>
        ) : (
          <DataTable rows={outstandingVoters.map(email => ({ email: email || '' }))} headers={outstandingVotesHeader} allowCopy={true} />
        )}
      </div>

      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Vote Results</h3>
        {voteResults.length === 0 ? (
          <p className="text-secondary text-center py-4">No votes yet</p>
        ) : (
          <DataTable rows={voteResults} headers={voteHeaders} allowCopy={true} />
        )}
      </div>
    </div>
  );
}

export default async function AdminRoundPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slugParam = resolvedParams.slug;

  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-12 bg-background-secondary/30 animate-pulse rounded" /></div>}>
      <RoundDetailContent slug={slugParam} />
    </Suspense>
  );
}
