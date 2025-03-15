import Head from "next/head";
import { roundProvider, userParticipationProvider } from "@/providers";
import { RoundsDisplay } from "./index/Homepage/RoundsDisplay";
import { HowItWorks } from "./index/Homepage/HowItWorks";
import { ClientHero } from "./ClientHero";
import { Suspense } from "react";
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Phase } from "@/types";

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

const Homepage = async () => {
  const { roundDetails: userDetails } = await userParticipationProvider();
  
  // If user is logged in, redirect to dashboard
  if (userDetails?.user.userid) {
    redirect('/dashboard');
  }
  const currentRound = await roundProvider();
  // Default values when no round is active
  const defaultRoundInfo = {
    roundId: null,
    phase: 'signups' as Phase,
    song: { artist: '', title: '' },
    dateLabels: {
      signups: { opens: '', closes: '' },
      voting: { opens: '', closes: '' },
      covering: { opens: '', closes: '' },
      celebration: { opens: '', closes: '' }
    },
    hasRoundStarted: false,
    areSubmissionsOpen: false
  };

  const {
    phase,
  } = currentRound || defaultRoundInfo;

  const isVotingPhase = phase === "voting";

  const { roundDetails } = await userParticipationProvider();
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <ClientHero
        roundInfo={currentRound}
        userRoundDetails={roundDetails ?? undefined}
      />
      <div className="space-y-24 mt-16 md:mt-24">
        <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading...</div>}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading...</div>}>
          <RoundsDisplay 
            currentRoundId={currentRound?.roundId ?? null} 
            isVotingPhase={isVotingPhase} 
            phase={phase}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default Homepage;
