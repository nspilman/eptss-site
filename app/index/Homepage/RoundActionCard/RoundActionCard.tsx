"use client";
import { Phase } from "@/types";
import { CTA } from "./CTA";
import { differenceInMilliseconds } from "date-fns";
import { getBlurb } from "../HowItWorks/getBlurb";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/components/client/context/EmailAuthModalContext";
import { Navigation } from "@/enum/navigation";
import { UserRoundDetails } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Props {
  phase: Phase;
  roundId: number;
  phaseEndsDate: string;
  phaseEndsDatelabel: string;
  userRoundDetails?: UserRoundDetails;
}

export const RoundActionCard = ({
  phase,
  roundId,
  phaseEndsDate,
  phaseEndsDatelabel,
  userRoundDetails,
}: Props) => {
  const router = useRouter();
  const { setIsOpen: openAuthModal } = useAuthModal();

  const isAuthed = !!userRoundDetails?.user?.userid;

  const completedCheckByPhase: { [key in Phase]: boolean } = {
    signups: userRoundDetails?.hasSignedUp || false,
    covering: userRoundDetails?.hasSubmitted || false,
    voting: userRoundDetails?.hasVoted || false,
    celebration: userRoundDetails?.hasSubmitted || false,
  };

  const roundActionFunctions = {
    onSignup: () => openAuthModal(),
    onSignupAndJoinRound: () => router.push(Navigation.SignUp),
    onJoinRound: () => router.push(Navigation.SignUp),
    onVote: () => router.push(Navigation.Voting),
    onSubmit: () => router.push(Navigation.Submit),
    onRoundDetails: () => router.push(`/round/${roundId}`),
  };

  const phaseEndsDaysFromToday = Math.ceil(
    differenceInMilliseconds(new Date(phaseEndsDate), new Date()) /
      (1000 * 60 * 60 * 24)
  );

  const specificDaysOrSoonLabel =
    phaseEndsDaysFromToday < 0
      ? "soon"
      : `in ${phaseEndsDaysFromToday} day${
          phaseEndsDaysFromToday !== 1 ? "s" : ""
        }`;

  const labelContent = (() => {
    const authedLabels: { [key in Phase]: string } = {
      signups: `Next round starts ${specificDaysOrSoonLabel}`,
      celebration: `Stay tuned for next round details!`,
      voting: `Voting ends ${specificDaysOrSoonLabel}`,
      covering: `Round ends ${specificDaysOrSoonLabel}`,
    };

    if (isAuthed) {
      return authedLabels[phase];
    } else {
      return phase === "signups"
        ? `Next round starts in ${phaseEndsDaysFromToday} days`
        : "Notify me when next round starts";
    }
  })();

  const blurb = getBlurb({ phase, roundId, phaseEndsDatelabel });

  return (
    <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col items-center space-y-6 max-w-3xl mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-8 border border-gray-700"
        >
      <Badge variant="secondary" className="bg-[#e2e240] text-[#0a0a1e] self-start">
        {phase === "signups" ? "Next Round" : "Now Covering"}
      </Badge>
      <h3 className="text-2xl font-semibold text-gray-100">
        {phase === "signups" ? "Join the next round" : `Round ${roundId}`}
      </h3>
      <p className="text-lg text-gray-300">{labelContent}</p>
      <p className="text-sm text-gray-400">{blurb}</p>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <CTA
          {...{
            roundActionFunctions,
            roundId,
            hasCompletedPhase: completedCheckByPhase[phase],
            isAuthed,
            phase,
          }}
        />
        <Button
          variant="outline"
          className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white transition-colors"
          onClick={roundActionFunctions.onRoundDetails}
        >
          Round Details
        </Button>
      </div>
    </motion.div>
  );
};