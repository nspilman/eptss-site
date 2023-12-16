import { RoundDetails } from "types";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import Head from "next/head";
import { Phase } from "services/PhaseMgmtService";
import { RoundsDisplay } from "./RoundsDisplay";
import { useRouter } from "next/router";
import { useAuthModal } from "components/context/EmailAuthModal";
import { useUserSession } from "components/context/UserSessionContext";
import { RoundActionCard } from "./RoundActionCard";
import { Navigation } from "components/enum/navigation";

export interface Props {
  roundContent: RoundDetails[];
  phaseInfo: {
    phase: Phase;
    phaseEndsDate: string;
    phaseEndsDatelabel: string;
    roundId: number;
  };
}

export const Homepage = ({ roundContent, phaseInfo }: Props) => {
  const { phase, roundId, phaseEndsDate, phaseEndsDatelabel } = phaseInfo;
  const isVotingPhase = phase === "voting";

  const router = useRouter();

  const { user, isLoading, userRoundDetails } = useUserSession();

  const isAuthed = !!user;

  const completedCheckByPhase: { [key in Phase]: boolean } = {
    signups: userRoundDetails?.hasSignedUp,
    covering: userRoundDetails?.hasSubmitted,
    voting: userRoundDetails?.hasVoted,
    celebration: userRoundDetails?.hasSubmitted,
  };

  const { setIsOpen: openAuthModal } = useAuthModal();

  const roundActionFunctions = {
    onProfile: () => router.push(Navigation.Profile),
    onSignup: () => openAuthModal(),
    onSignupAndJoinRound: () => router.push(Navigation.SignUp),
    onJoinRound: () => router.push(Navigation.SignUp),
    onVote: () => router.push(Navigation.Voting),
    onSubmit: () => router.push(Navigation.Submit),
    onRoundDetails: () => router.push(`/round/${roundId}`),
  };

  return (
    <div className="flex flex-col items-center">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <Hero />

      <div className="pointer-events-none">
        <div className="absolute top-28 -left-4 w-80 h-80 bg-themeYellow rounded-full mix-blend-lighten filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-28 left-40 w-80 h-80 bg-white rounded-full mix-blend-lighten filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-28 left-60 w-80 h-80 bg-bgGradientLighterBLue rounded-full mix-blend-lighten filter blur-xl opacity-40 animate-blob"></div>
      </div>
      <div className="mt-8 md:-mt-20 mb-12">
        <RoundActionCard
          loading={isLoading}
          phase={phase}
          roundId={roundId}
          isAuthed={isAuthed}
          hasCompletedPhase={completedCheckByPhase[phase]}
          roundActionFunctions={roundActionFunctions}
          phaseEndsDate={phaseEndsDate}
          phaseEndsDatelabel={phaseEndsDatelabel}
        />
      </div>
      <RoundsDisplay
        rounds={roundContent}
        currentRound={phaseInfo.roundId}
        isVotingPhase={isVotingPhase}
      />
      <HowItWorks />
    </div>
  );
};
