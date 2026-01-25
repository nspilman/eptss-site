import { redirect } from 'next/navigation';
import { getAuthUser } from '@eptss/auth/server';
import { PageTitle } from "@/components/PageTitle";
import { ReflectionForm } from '@eptss/user-content';
import { getUserInitialReflectionForRound, getProjectIdFromSlug, type ProjectSlug } from '@eptss/core';
import { getRoundBySlug } from '@eptss/rounds/services';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ projectSlug: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;

  return {
    title: `Create Reflection | ${resolvedParams.slug} | Everyone Plays the Same Song`,
    description: "Share your reflection on this round with the EPTSS community.",
  };
}

const CreateReflectionPage = async ({ params }: Props) => {
  const resolvedParams = await params;

  // Check authentication
  const { userId } = await getAuthUser();
  if (!userId) {
    redirect(`/login?redirect=/projects/${resolvedParams.projectSlug}/round/${resolvedParams.slug}/create-reflection`);
  }

  // Get project ID from slug
  const projectId = getProjectIdFromSlug(resolvedParams.projectSlug as ProjectSlug);

  // Get round data
  const roundResult = await getRoundBySlug(projectId, resolvedParams.slug);
  if (roundResult.status !== 'success' || !roundResult.data) {
    redirect(`/projects/${resolvedParams.projectSlug}/rounds`);
  }

  const round = roundResult.data;

  // Check if user has an initial reflection
  const initialReflectionResult = await getUserInitialReflectionForRound(userId, round.roundId);
  const hasInitialReflection = initialReflectionResult.status === 'success' && !!initialReflectionResult.data;

  return (
    <>
      <PageTitle title={`Create Reflection - ${resolvedParams.slug}`} />
      <ReflectionForm
        userId={userId}
        round={round}
        hasInitialReflection={hasInitialReflection}
      />
    </>
  );
};

export default CreateReflectionPage;
