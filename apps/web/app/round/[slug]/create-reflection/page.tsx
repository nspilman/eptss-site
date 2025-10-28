import { redirect } from 'next/navigation';
import { createClient, getAuthUser } from '@/utils/supabase/server';
import { PageTitle } from "@/components/PageTitle";
import { ReflectionForm } from './ReflectionForm';
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

async function checkAuthentication() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return { supabase, userId: (await getAuthUser()).userId };
}

async function getRoundData(supabase: any, slug: string) {
  const { data: roundData, error } = await supabase
    .from('round_metadata')
    .select('id, slug')
    .eq('slug', slug)
    .single();

  if (error || !roundData) {
    return null;
  }

  return roundData;
}

const CreateReflectionPage = async ({ params }: Props) => {
  const resolvedParams = await params;

  // Check authentication
  const authResult = await checkAuthentication();
  if (!authResult) {
    redirect(`/login?redirect=/round/${resolvedParams.slug}/create-reflection`);
  }

  const { supabase, userId } = authResult;

  // Get round data
  const roundData = await getRoundData(supabase, resolvedParams.slug);
  if (!roundData) {
    redirect('/rounds');
  }

  return (
    <>
      <PageTitle title={`Create Reflection - ${resolvedParams.slug}`} />
      <ReflectionForm
        userId={userId}
        roundId={roundData.id}
        roundSlug={roundData.slug}
      />
    </>
  );
};

export default CreateReflectionPage;
