import { getAuthUser } from "@eptss/data-access/utils/supabase/server";
import { roundProvider, userParticipationProvider, getProjectIdFromSlug, type ProjectSlug } from "@eptss/data-access";
import { CommentSection } from "@eptss/comments";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@eptss/ui";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Props {
  params: Promise<{ projectSlug: string }>;
}

export default async function DiscussionsPage({ params }: Props) {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  const { userId } = await getAuthUser();

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gray-900-40)] border border-[var(--color-gray-700)] mb-4">
            <MessageSquare className="w-8 h-8 text-[var(--color-accent-primary)]" />
          </div>
          <h1 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl md:text-4xl">
            Round Discussions
          </h1>
          <p className="text-[var(--color-gray-400)] text-lg max-w-xl mx-auto">
            Please log in to view and participate in round discussions.
          </p>
          <Link href="/auth/login">
            <Button variant="secondary" size="lg">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get current round for this project
  const currentRound = await roundProvider({ projectId });

  if (!currentRound) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gray-900-40)] border border-[var(--color-gray-700)] mb-4">
            <MessageSquare className="w-8 h-8 text-[var(--color-accent-primary)]" />
          </div>
          <h1 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl md:text-4xl">
            Round Discussions
          </h1>
          <p className="text-[var(--color-gray-400)] text-lg max-w-xl mx-auto">
            There is no active round at the moment.
          </p>
        </div>
      </div>
    );
  }

  // Check if user is a participant
  const { roundDetails } = await userParticipationProvider({ projectId });
  const isParticipant = roundDetails?.hasSignedUp || false;

  if (!isParticipant) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gray-900-40)] border border-[var(--color-gray-700)] mb-4">
            <MessageSquare className="w-8 h-8 text-[var(--color-accent-primary)]" />
          </div>
          <h1 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl md:text-4xl">
            Round Discussions
          </h1>
          <p className="text-[var(--color-gray-400)] text-lg max-w-xl mx-auto">
            You must be a participant in this round to view discussions.
          </p>
          <p className="text-[var(--color-gray-300)]">
            Sign up for <strong>{currentRound.song?.title}</strong> by <strong>{currentRound.song?.artist}</strong> to join the conversation!
          </p>
          <Link href={`/projects/${projectSlug}/sign-up`}>
            <Button variant="secondary" size="lg">
              Sign Up for This Round
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // User is authenticated and is a participant - show discussions
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-12">
        <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-6"></div>
        <div className="flex items-center gap-4 mb-4">
          <MessageSquare className="w-8 h-8 text-[var(--color-accent-primary)]" />
          <h1 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl md:text-4xl">
            Round Discussions
          </h1>
        </div>
        <p className="text-[var(--color-gray-400)] text-lg">
          Connect with fellow participants covering <span className="text-[var(--color-accent-primary)] font-medium">{currentRound.song?.title}</span> by <span className="text-[var(--color-accent-primary)] font-medium">{currentRound.song?.artist}</span>
        </p>
      </div>

      {/* Comment Section - using round ID for discussions */}
      <CommentSection
        roundId={currentRound.roundId}
        currentUserId={userId}
        sortOrder="asc"
      />
    </div>
  );
}
