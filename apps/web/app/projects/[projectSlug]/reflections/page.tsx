import { getAuthUser } from "@eptss/core/utils/supabase/server";
import { roundProvider, userParticipationProvider, getProjectIdFromSlug, type ProjectSlug, getReflectionsByRound } from "@eptss/core";
import { FileText } from "lucide-react";
import Link from "next/link";
import { Button, Card, CardHeader, CardContent } from "@eptss/ui";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Props {
  params: Promise<{ projectSlug: string }>;
}

export default async function ReflectionsPage({ params }: Props) {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  const { userId } = await getAuthUser();

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gray-900-40)] border border-[var(--color-gray-700)] mb-4">
            <FileText className="w-8 h-8 text-[var(--color-accent-primary)]" />
          </div>
          <h1 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl md:text-4xl">
            Round Reflections
          </h1>
          <p className="text-[var(--color-gray-400)] text-lg max-w-xl mx-auto">
            Please log in to view round reflections.
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
            <FileText className="w-8 h-8 text-[var(--color-accent-primary)]" />
          </div>
          <h1 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl md:text-4xl">
            Round Reflections
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
            <FileText className="w-8 h-8 text-[var(--color-accent-primary)]" />
          </div>
          <h1 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl md:text-4xl">
            Round Reflections
          </h1>
          <p className="text-[var(--color-gray-400)] text-lg max-w-xl mx-auto">
            You must be a participant in this round to view reflections.
          </p>
          <p className="text-[var(--color-gray-300)]">
            Sign up for <strong>{currentRound.song?.title}</strong> by <strong>{currentRound.song?.artist}</strong> to see what others are reflecting on!
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

  // Get all reflections for this round
  const reflectionsResult = await getReflectionsByRound(currentRound.roundId, true);
  const reflections = reflectionsResult.status === 'success' ? reflectionsResult.data || [] : [];

  // User is authenticated and is a participant - show reflections
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-12">
        <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-6"></div>
        <div className="flex items-center gap-4 mb-4">
          <FileText className="w-8 h-8 text-[var(--color-accent-primary)]" />
          <h1 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl md:text-4xl">
            Round Reflections
          </h1>
        </div>
        <p className="text-[var(--color-gray-400)] text-lg">
          See what participants are thinking about <span className="text-[var(--color-accent-primary)] font-medium">{currentRound.song?.title}</span> by <span className="text-[var(--color-accent-primary)] font-medium">{currentRound.song?.artist}</span>
        </p>
      </div>

      {/* Reflections Grid */}
      {reflections.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reflections.map((reflection) => (
            <Link
              key={reflection.id}
              href={`/projects/${projectSlug}/reflections/${reflection.slug}`}
              className="block hover:opacity-80 transition-opacity"
            >
              <Card className="h-full">
                <CardHeader>
                  <h3 className="text-lg font-semibold line-clamp-2">
                    {reflection.title}
                  </h3>
                  {reflection.authorName && (
                    <p className="text-sm text-gray-400 mt-1">
                      by {reflection.authorName}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-400 mb-2">
                    {new Date(reflection.publishedAt || reflection.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-300 line-clamp-3">
                    {reflection.markdownContent.substring(0, 150)}
                    {reflection.markdownContent.length > 150 && '...'}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gray-900-40)] border border-[var(--color-gray-700)] mb-4">
            <FileText className="w-8 h-8 text-[var(--color-accent-secondary)]" />
          </div>
          <p className="text-[var(--color-gray-400)] text-lg">
            No reflections have been shared yet.
          </p>
          <p className="text-[var(--color-gray-500)] text-sm mt-2">
            Be the first to share your thoughts on this round!
          </p>
        </div>
      )}
    </div>
  );
}
