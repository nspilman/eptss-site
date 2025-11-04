import Head from "next/head";
import { HowItWorks } from "./index/Homepage/HowItWorks";
import { Metadata } from 'next';
import { StaticHero } from "./StaticHero";
import { RoundInfoDisplay } from "@eptss/rounds";
import { ClientRoundsDisplay } from "./index/Homepage/RoundsDisplay/ClientRoundsDisplay";
import { roundProvider } from "@eptss/data-access";

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
  const roundInfo = await roundProvider();
  const { rounds, currentRoundId, isVotingPhase } = await getRoundsData();
  
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-16">
        <StaticHero />
        <div className="flex justify-center md:justify-end">
          <RoundInfoDisplay roundInfo={roundInfo} />
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
