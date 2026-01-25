import { Metadata } from 'next';
import { roundProvider } from "@eptss/core";
import { roundsProvider } from "@eptss/rounds/providers";
import { getProjectIdFromSlug, isValidProjectSlug, type ProjectSlug } from '@eptss/core';
import {
  getProjectPageContent,
  getProjectSEOMetadata,
  getHowItWorksContent,
  getRoundInfoLabels,
  getSubmissionsGalleryContent
} from '@eptss/project-config';
import { notFound } from 'next/navigation';
import { ProjectHero } from './components/ProjectHero';
import { ConfigDrivenHowItWorks } from './components/ConfigDrivenHowItWorks';
import { SubmissionsGallery } from './components/SubmissionsGallery';
import { RoundInfoCard } from './components/RoundInfoCard';

interface ProjectPageProps {
  params: Promise<{ projectSlug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;

  // Validate slug
  if (!isValidProjectSlug(projectSlug)) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found",
    };
  }

  // Get SEO metadata from config
  const seoMetadata = await getProjectSEOMetadata(projectSlug as ProjectSlug);
  const { landingPage } = seoMetadata;

  return {
    title: landingPage.title,
    description: landingPage.description,
    openGraph: {
      title: landingPage.ogTitle || landingPage.title,
      description: landingPage.ogDescription || landingPage.description,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: landingPage.title,
        },
      ],
    },
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
  const { projectSlug } = resolvedParams;

  // Validate slug
  if (!isValidProjectSlug(projectSlug)) {
    notFound();
  }

  // Get project ID
  const projectId = getProjectIdFromSlug(projectSlug);

  // Fetch project content from config
  const pageContent = await getProjectPageContent(projectSlug as ProjectSlug);
  const howItWorksContent = await getHowItWorksContent(projectSlug as ProjectSlug);
  const roundInfoLabels = await getRoundInfoLabels(projectSlug as ProjectSlug);
  const submissionsGalleryContent = await getSubmissionsGalleryContent(projectSlug as ProjectSlug);

  // Fetch round info for this project
  const roundInfo = await roundProvider({ projectId });

  // Fetch rounds data
  const { rounds, currentRoundId, isVotingPhase } = await getProjectRoundsData(projectId);

  // Render generic project landing page with project-specific content
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-16">
        <ProjectHero
          projectSlug={projectSlug}
          content={pageContent.home.hero}
        />
        <div className="flex justify-center md:justify-end">
          <RoundInfoCard roundInfo={roundInfo} labels={roundInfoLabels} />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-24 mt-16 md:mt-24">
        <ConfigDrivenHowItWorks content={howItWorksContent} projectSlug={projectSlug} />

        <section id="submissions">
          <SubmissionsGallery submissions={rounds} content={submissionsGalleryContent} />
        </section>
      </div>
    </div>
  );
}
