import { redirect } from 'next/navigation';
import { getAuthUser } from '@eptss/auth';
import { PageTitle } from "@/components/PageTitle";
import { ReflectionEditForm } from '@eptss/user-content';
import { getReflectionBySlug } from '@eptss/data-access';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;

  return {
    title: `Edit Reflection | ${resolvedParams.slug} | Everyone Plays the Same Song`,
    description: "Edit your reflection on this round.",
  };
}

const EditReflectionPage = async ({ params }: Props) => {
  const resolvedParams = await params;

  // Check authentication
  const { userId } = await getAuthUser();
  if (!userId) {
    redirect(`/login?redirect=/reflections/${resolvedParams.slug}/edit`);
  }

  // Get reflection data
  const reflectionResult = await getReflectionBySlug(resolvedParams.slug);
  if (reflectionResult.status !== 'success' || !reflectionResult.data) {
    redirect('/dashboard');
  }

  const reflection = reflectionResult.data;

  // Verify ownership - only the author can edit
  if (reflection.userId !== userId) {
    redirect(`/reflections/${resolvedParams.slug}`);
  }

  return (
    <>
      <PageTitle title={`Edit Reflection - ${reflection.title}`} />
      <ReflectionEditForm reflection={reflection} />
    </>
  );
};

export default EditReflectionPage;
