import Head from "next/head";
import { roundProvider, userParticipationProvider } from "@/providers";
import { RoundsDisplay } from "./index/Homepage/RoundsDisplay";
import { HowItWorks } from "./index/Homepage/HowItWorks";
import { ClientHero } from "./ClientHero";
import { getBlurb } from "./index/Homepage/HowItWorks/getBlurb";
import { Navigation } from "@/enum/navigation";
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
    roundId,
    phase,
    song,
    dateLabels,
    hasRoundStarted,
    areSubmissionsOpen,
  } = currentRound || defaultRoundInfo;

  const isVotingPhase = phase === "voting";

  const { roundDetails } = await userParticipationProvider();
  // Only try to get next round if we have a valid roundId
  const nextRound = typeof roundId === 'number' 
    ? await roundProvider(roundId + 1)
    : null;

  const signedUpBlurb = roundId ? getBlurb({
    phase,
    roundId,
    phaseEndsDatelabel: dateLabels[phase].closes,
  }) : '';

  const nextRoundId = typeof roundId === 'number' && hasRoundStarted ? roundId + 1 : '';
  const signupLink = `${Navigation.SignUp}/${nextRoundId
  }`;

  const submitRoundId = typeof roundId === 'number' ? roundId : '';
  const submissionRoundId = typeof roundId === 'number' && !areSubmissionsOpen ? roundId - 1 : '';
  const submitLink = `${Navigation.Submit}/${submissionRoundId}`;

  const displayRoundId = typeof roundId === 'number' ? (hasRoundStarted ? roundId + 1 : roundId) : 'the next';
  const signupsAreOpenString = `Signups are open for round ${displayRoundId
  }`;

  return (
    <div className="">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <ClientHero
        roundInfo={currentRound}
        userRoundDetails={roundDetails ?? undefined}
      />
        <div className="flex flex-col gap-8 py-8">
          <Suspense>
            <HowItWorks />
          </Suspense>
          <RoundsDisplay 
          currentRoundId={currentRound?.roundId ?? null} 
          isVotingPhase={isVotingPhase} 
          phase={phase}
        />
        </div>
    </div>
  );
};

export default Homepage;
