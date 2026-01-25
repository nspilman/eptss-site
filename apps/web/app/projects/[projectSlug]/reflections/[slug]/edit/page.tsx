import { getReflectionBySlug } from '@eptss/core';
import { getAuthUser } from '@eptss/core/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { ReflectionEditForm, type Reflection } from '@eptss/user-content';

interface EditReflectionPageProps {
  params: Promise<{ projectSlug: string; slug: string }>;
}

export async function generateMetadata({ params }: EditReflectionPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const result = await getReflectionBySlug(slug);

  if (result.status !== 'success' || !result.data) {
    return {
      title: 'Edit Reflection',
    };
  }

  return {
    title: `Edit: ${result.data.title} | Everyone Plays the Same Song`,
  };
}

export default async function EditReflectionPage({ params }: EditReflectionPageProps) {
  const resolvedParams = await params;
  const { projectSlug, slug } = resolvedParams;

  // Check if user is authenticated
  const { userId } = await getAuthUser();
  if (!userId) {
    redirect(`/login?redirect=/projects/${projectSlug}/reflections/${slug}/edit`);
  }

  // Fetch the reflection
  const result = await getReflectionBySlug(slug);

  if (result.status !== 'success' || !result.data) {
    notFound();
  }

  const reflectionData = result.data;

  // Check if user owns this reflection
  if (reflectionData.userId !== userId) {
    redirect(`/projects/${projectSlug}/reflections/${slug}`);
  }

  // Map data-access Reflection to user-content Reflection type
  const reflection: Reflection = {
    id: reflectionData.id,
    userId: reflectionData.userId,
    roundId: reflectionData.roundId,
    title: reflectionData.title,
    slug: reflectionData.slug,
    markdownContent: reflectionData.markdownContent,
    isPublic: reflectionData.isPublic,
    createdAt: reflectionData.createdAt,
    updatedAt: reflectionData.updatedAt,
    publishedAt: reflectionData.publishedAt,
    tags: reflectionData.tags,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6">
        Edit Reflection
      </h1>
      <ReflectionEditForm reflection={reflection} projectSlug={projectSlug} />
    </div>
  );
}
