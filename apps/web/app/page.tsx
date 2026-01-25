import Head from "next/head";
import { HowItWorks } from "./index/Homepage/HowItWorks";
import { Metadata } from 'next';
import { StaticHero } from "./StaticHero";
import { RoundInfoDisplay } from "@eptss/rounds";
import { ClientRoundsDisplay } from "./index/Homepage/RoundsDisplay/ClientRoundsDisplay";
import { roundProvider, getAllProjects } from "@eptss/core";
import Link from "next/link";

import { Text } from "@eptss/ui";
export const metadata: Metadata = {
  title: "Everyone Plays the Same Song | Quarterly Community Cover Project",
  description: "Every quarter, our community picks one song. Everyone creates their own unique cover version. Then we celebrate with a virtual listening party! Join our next round.",
  openGraph: {
    title: "Everyone Plays the Same Song | Quarterly Community Cover Project",
    description: "Every quarter, our community picks one song. Everyone creates their own unique cover version. Then we celebrate with a virtual listening party! Join our next round.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Everyone Plays the Same Song Community",
      },
    ],
  },
};

// Enable static generation with revalidation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

async function getRoundsData() {
  try {
    // Fetch current round to determine phase
    const currentRoundResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/round/current`,
      { next: { revalidate: 3600 } }
    );
    const currentRoundData = await currentRoundResponse.json();
    
    // Fetch rounds data
    const excludeCurrentRound = currentRoundData?.phase === 'signups';
    const roundsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/rounds?excludeCurrentRound=${excludeCurrentRound}`,
      { next: { revalidate: 3600 } }
    );
    const roundsData = await roundsResponse.json();
    
    return {
      rounds: roundsData.roundContent || [],
      currentRoundId: currentRoundData?.roundId || null,
      isVotingPhase: currentRoundData?.phase === 'voting',
    };
  } catch (error) {
    console.error("Error fetching rounds data:", error);
    return {
      rounds: [],
      currentRoundId: null,
      isVotingPhase: false,
    };
  }
}

// Static homepage with data fetched at build time
const Homepage = async () => {
  // Get all active projects
  const allProjects = await getAllProjects();
  const activeProjects = allProjects.filter(p => p.isActive);

  // Get round info for each project
  const projectsWithRounds = await Promise.all(
    activeProjects.map(async (project) => {
      try {
        const roundInfo = await roundProvider({ projectId: project.id });
        return {
          ...project,
          roundInfo,
        };
      } catch (error) {
        console.error(`Error fetching round for project ${project.slug}:`, error);
        return {
          ...project,
          roundInfo: null,
        };
      }
    })
  );

  const { rounds, currentRoundId, isVotingPhase } = await getRoundsData();

  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-16">
        <StaticHero />
        <div className="flex flex-col gap-6">
          {/* Show all active projects */}
          {projectsWithRounds.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="block"
            >
              <div className="bg-background-secondary border-2 border-border rounded-xl p-6 hover:border-accent-primary transition-all duration-300 hover:shadow-lg hover:shadow-accent-primary/20">
                <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                {project.config?.metadata?.description && (
                  <Text size="sm" color="secondary" className="mb-4">{project.config.metadata.description}</Text>
                )}
                {project.roundInfo && <RoundInfoDisplay roundInfo={project.roundInfo} />}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="space-y-24 mt-16 md:mt-24">
        <HowItWorks />
        <section id="rounds">
          <ClientRoundsDisplay
            rounds={rounds}
            currentRoundId={currentRoundId}
            isVotingPhase={isVotingPhase}
          />
        </section>
      </div>
    </div>
  );
};

export default Homepage;
