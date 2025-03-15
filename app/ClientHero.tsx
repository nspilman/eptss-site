"use client";

import { Button, Badge } from "@/components/ui/primitives";
import { motion } from "framer-motion";
import React from "react";
import { Phase, RoundInfo } from "@/types/round";
import { UserRoundParticipation } from "@/types/user";
import { Navigation } from "@/enum/navigation";
import Link from "next/link";

type HeroActionsClientProps = {
  roundInfo: RoundInfo | null;
  userRoundDetails: UserRoundParticipation | undefined;
};

type ButtonProps = {
  text: string;
  href: string;
  variant?: "primary" | "secondary";
};

export const ClientHero = ({
  userRoundDetails,
  roundInfo,
}: HeroActionsClientProps) => {
  const { song, roundId, phase } = roundInfo || {
    song: { title: '', artist: '' },
    roundId: null,
    phase: 'signups' as Phase
  };

  const completedCheckByPhase: { [key in Phase]: boolean } = {
    signups: userRoundDetails?.hasSignedUp || false,
    covering: userRoundDetails?.hasSubmitted || false,
    voting: userRoundDetails?.hasVoted || false,
    celebration: userRoundDetails?.hasSubmitted || false,
  };

  const userId = userRoundDetails?.user.userid

  const getButtonProps = (): ButtonProps[] => {
    if (!userId) {
      // Handle signed out user states
      if (phase === "voting" || phase === "covering") {
        const buttons: ButtonProps[] = [
          {
            text: "Join Waitlist",
            href: Navigation.Waitlist,
            variant: "secondary"
          }
        ];
        
        if (phase === "covering") {
          buttons.unshift({
            text: "Sign Up to Cover",
            href: Navigation.SignUp,
            variant: "primary"
          });
        }
        
        return buttons;
      }
      return [{
        text: "Join Next Round",
        href: Navigation.SignUp,
        variant: "primary"
      }];
    }

    // Handle signed in user states
    const isInCurrentRound = userRoundDetails?.hasSignedUp;

    if (isInCurrentRound) {
      switch (phase) {
        case "covering":
          return [
            {
              text: completedCheckByPhase.covering ? "Update Submission" : "Submit Cover",
              href: Navigation.Submit,
              variant: "primary"
            },
            {
              text: "Invite Others",
              href: Navigation.SignUp,
              variant: "secondary"
            },
          ];
        case "voting":
          return [{
            text: completedCheckByPhase.voting ? "Update Vote" : "Vote Now",
            href: Navigation.Voting,
            variant: "primary"
          }];
        default:
          return [{
            text: "Round Details",
            href: `/round/${roundId}`,
            variant: "primary"
          }];
      }
    }

    // User is signed in but not in current round
    if (phase === "voting" || phase === "covering") {
      const buttons: ButtonProps[] = [
        {
          text: "Join Waitlist",
          href: Navigation.Waitlist,
          variant: "secondary"
        }
      ];
      
      if (phase === "covering") {
        buttons.unshift({
          text: "Sign Up to Cover",
          href: Navigation.SignUp,
          variant: "primary"
        });
      }
      
      return buttons;
    }

    // Default case
    return [{
      text: "Round Details",
      href: `/round/${roundId}`,
      variant: "primary"
    }];
  };

  const buttonProps = getButtonProps();
  const primaryButton = buttonProps.find(btn => btn.variant === "primary") || buttonProps[0];
  const secondaryButton = buttonProps.find(btn => btn.variant === "secondary");

  return (
    <main className="flex flex-col space-y-6 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mt-12 mb-16"
      >
        <div className="max-w-2xl md:mb-0 flex flex-col items-center md:items-start">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-bold mb-6 leading-tight text-center md:text-left"
          >
            <span className="text-4xl sm:text-6xl text-white">
              Make Music <span className="text-[#e2e240]">Together</span>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 text-center md:text-left"
          >
            One song. Your unique version. A community of musicians.
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8 w-full md:w-auto"
          >
            <Link href={Navigation.SignUp}>
              <Button className="w-full md:w-auto bg-[#e2e240] text-gray-900 hover:bg-[#e2e240]/90 px-8 py-3 text-lg font-medium">
                Join Next Round
              </Button>
            </Link>
            <div className="text-sm text-gray-400 mt-2 text-center md:text-left">No commitment required</div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-[420px] bg-gray-900/60 rounded-xl p-8 backdrop-blur-sm border border-gray-800 shadow-xl"
        >
          {song.title ? (
            <>
              <Badge className="mb-4 bg-[#e2e240] text-gray-900 hover:bg-[#e2e240] px-3 py-1 text-sm font-medium">
                Now Covering
              </Badge>
              <h2 className="text-3xl font-bold mb-3 text-white">
                {song.title}
              </h2>
              <p className="text-xl text-gray-300 mb-4">
                by <span className="text-[#e2e240]">{song.artist}</span>
              </p>
              <div className="text-sm text-gray-400 mb-6 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#e2e240]" />
                {roundInfo ? `Round ${roundId} - covers due ${new Date(roundInfo.dateLabels.celebration.closes).toLocaleDateString()}` : 'Next round dates to be announced'}
              </div>
            </>
          ) : (
            <>
              <Badge className="mb-4 bg-[#e2e240] text-gray-900 hover:bg-[#e2e240] px-3 py-1 text-sm font-medium">
                Coming Soon
              </Badge>
              <h2 className="text-3xl font-bold mb-3 text-white">
                Next Round
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Join us for our next creative challenge!
              </p>
            </>
          )}
          
          <div className="space-y-3">
            <Link href={primaryButton.href}>
              <Button className="w-full bg-[#e2e240] text-gray-900 hover:bg-[#e2e240]/90 py-3 text-lg font-medium">
                {primaryButton.text}
              </Button>
            </Link>
            {secondaryButton && (
              <Link href={secondaryButton.href}>
                <Button variant="outline" className="w-full border-gray-700 text-gray-200 hover:bg-gray-800 py-3">
                  {secondaryButton.text}
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
};
