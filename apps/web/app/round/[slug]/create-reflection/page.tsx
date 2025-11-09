import { redirect } from 'next/navigation';
import { getAuthUser } from '@eptss/auth/server';
import { PageTitle } from "@/components/PageTitle";
import { ReflectionForm } from '@eptss/user-content';
import { getRoundBySlug, getUserInitialReflectionForRound } from '@eptss/data-access';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
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
    redirect(`/login?redirect=/round/${resolvedParams.slug}/create-reflection`);
  }

  // Get round data
  const roundResult = await getRoundBySlug(resolvedParams.slug);
  if (roundResult.status !== 'success' || !roundResult.data) {
    redirect('/rounds');
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
