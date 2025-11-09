import { notFound } from 'next/navigation';
import { PageTitle } from "@/components/PageTitle";
import { Post } from "@/app/blog/Blog/Post";
import { getReflectionBySlug } from '@eptss/data-access';
import { getAuthUser } from '@eptss/auth/server';
import { Metadata } from 'next';
import { CommentSection } from '@eptss/comments';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getReflectionBySlug(resolvedParams.slug);

  if (result.status !== 'success' || !result.data) {
    return {
      title: "Reflection Not Found | Everyone Plays the Same Song",
      description: "The requested reflection could not be found.",
    };
  }

  const reflection = result.data;

  return {
    title: `${reflection.title} | EPTSS Reflection`,
    description: reflection.markdownContent.substring(0, 160) || "Read this reflection from Everyone Plays the Same Song community.",
    openGraph: {
      title: `${reflection.title} | EPTSS Reflection`,
      description: reflection.markdownContent.substring(0, 160) || "Read this reflection from Everyone Plays the Same Song community.",
      type: 'article',
      publishedTime: reflection.publishedAt || reflection.createdAt,
    },
  };
}

const ReflectionPage = async ({ params }: Props) => {
  const resolvedParams = await params;
  const result = await getReflectionBySlug(resolvedParams.slug);

  if (result.status !== 'success' || !result.data) {
    notFound();
  }

  const reflection = result.data;

  // Get current user
  const { userId } = await getAuthUser();

  // Only show public reflections OR private reflections if user is the author
  const isAuthor = userId === reflection.userId;
  if (!reflection.isPublic && !isAuthor) {
    notFound();
  }

  // Transform reflection to match blog post format
  const post = {
    slug: reflection.slug,
    content: reflection.markdownContent,
    frontmatter: {
      title: reflection.title,
      subtitle: '', // Reflections don't have subtitles yet
      date: reflection.publishedAt || reflection.createdAt,
      author: reflection.authorName,
    },
  };

  return (
    <>
      <PageTitle title={reflection.title} />
      <Post post={post} authorUsername={reflection.authorUsername} />

      {/* Comments Section */}
      <div className="px-4 py-12">
        <CommentSection
          contentId={reflection.id}
          contentAuthorId={reflection.userId}
          currentUserId={userId}
        />
      </div>
    </>
  );
};

export default ReflectionPage;
