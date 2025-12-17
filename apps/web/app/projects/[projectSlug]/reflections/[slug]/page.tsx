import { getReflectionBySlug } from '@eptss/data-access';
import { getAuthUser } from '@eptss/data-access/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { MarkdownContent, CommentSection } from '@eptss/comments';
import { Badge } from '@eptss/ui';

interface ReflectionPageProps {
  params: Promise<{ projectSlug: string; slug: string }>;
}

export async function generateMetadata({ params }: ReflectionPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const result = await getReflectionBySlug(slug);

  if (result.status !== 'success' || !result.data) {
    return {
      title: 'Reflection Not Found',
    };
  }

  const reflection = result.data;

  return {
    title: `${reflection.title} | Everyone Plays the Same Song`,
    description: reflection.markdownContent.substring(0, 160),
  };
}

export default async function ReflectionPage({ params }: ReflectionPageProps) {
  const resolvedParams = await params;
  const { projectSlug, slug } = resolvedParams;

  const result = await getReflectionBySlug(slug);

  if (result.status !== 'success' || !result.data) {
    notFound();
  }

  const reflection = result.data;

  // Get current user for comments
  const { userId } = await getAuthUser();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href={`/projects/${projectSlug}/dashboard`}
        className="inline-flex items-center gap-2 text-sm text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-4">
          {reflection.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-[var(--color-gray-400)]">
          {reflection.authorName && (
            <div className="flex items-center gap-2">
              <span>by</span>
              {reflection.authorUsername ? (
                <Link
                  href={`/profile/${reflection.authorUsername}`}
                  className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] transition-colors"
                >
                  {reflection.authorName}
                </Link>
              ) : (
                <span className="text-[var(--color-primary)]">{reflection.authorName}</span>
              )}
            </div>
          )}

          {reflection.publishedAt && (
            <>
              <span>•</span>
              <time dateTime={reflection.publishedAt}>
                {new Date(reflection.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </>
          )}

          {reflection.roundSlug && (
            <>
              <span>•</span>
              <Link
                href={`/projects/${projectSlug}/round/${reflection.roundSlug}`}
                className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] transition-colors"
              >
                Round: {reflection.roundSlug}
              </Link>
            </>
          )}

          <span>•</span>
          <Badge variant={reflection.isPublic ? "default" : "outline"}>
            {reflection.isPublic ? "Public" : "Private"}
          </Badge>
        </div>

        {reflection.tags && reflection.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {reflection.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-none mb-12">
        <MarkdownContent content={reflection.markdownContent} />
      </div>

      {/* Comments Section */}
      <div className="mt-12">
        <CommentSection
          userContentId={reflection.id}
          contentAuthorId={reflection.userId}
          currentUserId={userId || undefined}
        />
      </div>
    </div>
  );
}
