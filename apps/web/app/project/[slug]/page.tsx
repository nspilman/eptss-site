import { Metadata } from 'next';
import { roundProvider, roundsProvider } from "@eptss/data-access";
import { getProjectIdFromSlug, isValidProjectSlug } from '@eptss/data-access';
import { notFound } from 'next/navigation';
import { MonthlyOriginalHero } from './components/MonthlyOriginalHero';
import { OriginalHowItWorks } from './components/OriginalHowItWorks';
import { SubmissionsGallery } from './components/SubmissionsGallery';
import { OriginalRoundInfo } from './components/OriginalRoundInfo';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  if (slug === 'monthly-original') {
    return {
      title: "Monthly Original Song Challenge | Create Your Own Music",
      description: "Join our monthly original songwriting challenge. Write and record an original song every month with a supportive community of musicians and songwriters.",
      openGraph: {
        title: "Monthly Original Song Challenge | Create Your Own Music",
        description: "Join our monthly original songwriting challenge. Write and record an original song every month with a supportive community of musicians and songwriters.",
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
            width: 1200,
            height: 630,
            alt: "Monthly Original Song Challenge",
          },
        ],
      },
    };
  }

  return {
    title: "Project | Everyone Plays the Same Song",
    description: "Join our creative music community",
  };
}

// Enable static generation with revalidation
export const dynamic = 'force-static';
export const revalidate = 3600;

async function getProjectRoundsData(projectId: string) {
  try {
    // Fetch current round
    const currentRoundResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/round/current`,
      { next: { revalidate: 3600 } }
    );
    const currentRoundData = await currentRoundResponse.json();

    // Fetch rounds data for this specific project
    const { roundContent } = await roundsProvider({
      excludeCurrentRound: currentRoundData?.phase === 'signups',
      projectId
    });

    return {
      rounds: roundContent || [],
      currentRoundId: currentRoundData?.roundId || null,
      isVotingPhase: currentRoundData?.phase === 'voting',
    };
  } catch (error) {
    console.error("Error fetching project rounds data:", error);
    return {
      rounds: [],
      currentRoundId: null,
      isVotingPhase: false,
    };
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Validate slug
  if (!isValidProjectSlug(slug)) {
    notFound();
  }

  // Only render the monthly-original landing page
  if (slug !== 'monthly-original') {
    notFound();
  }

  // Get project ID
  const projectId = getProjectIdFromSlug(slug);

  // Fetch round info for this project
  const roundInfo = await roundProvider({ projectId });

  // Fetch rounds data
  const { rounds, currentRoundId, isVotingPhase } = await getProjectRoundsData(projectId);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-16">
        <MonthlyOriginalHero />
        <div className="flex justify-center md:justify-end">
          <OriginalRoundInfo roundInfo={roundInfo} />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-24 mt-16 md:mt-24">
        <OriginalHowItWorks />

        <section id="submissions">
          <SubmissionsGallery submissions={rounds} />
        </section>
      </div>
    </div>
  );
}
