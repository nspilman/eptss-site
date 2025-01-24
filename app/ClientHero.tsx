"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import React from "react";
import Link from "next/link";
import { JoinTheCreativeCommunity } from "./JoinTheCreativeCommunityButton";
import { Phase, RoundInfo } from "@/types/round";
import { UserRoundParticipation } from "@/types/user";
import { Navigation } from "@/enum/navigation";

type HeroActionsClientProps = {
  roundInfo: RoundInfo;
  userRoundDetails: UserRoundParticipation | undefined;
  nextRoundInfo: RoundInfo;
  signedUpBlurb: string;
  signupLink: string;
  submitLink: string;
  signupsAreOpenString: string;
};

type ButtonProps = {
  text: string;
  href: string;
};

export const ClientHero = ({
  userRoundDetails,
  roundInfo,
  signedUpBlurb,
  signupsAreOpenString,
  signupLink,
  submitLink,
}: HeroActionsClientProps) => {
  const { song, roundId, phase } = roundInfo;

  const completedCheckByPhase: { [key in Phase]: boolean } = {
    signups: userRoundDetails?.hasSignedUp || false,
    covering: userRoundDetails?.hasSubmitted || false,
    voting: userRoundDetails?.hasVoted || false,
    celebration: userRoundDetails?.hasSubmitted || false,
  };

  const userId = userRoundDetails?.user.userid

  const getHeroContent = () => {
    if (!userId) {
      return {
        title: "Join the next round",
        subtitle: "Be part of our creative community",
      };
    }

    switch (phase) {
      case "signups":
        return {
          title: song.title || "Voting on next song",
          subtitle: song.artist || "Submit your song choice",
        };
      case "covering":
        return {
          title: `Now Covering: ${song.title}`,
          subtitle: `by ${song.artist}`,
        };
      case "voting":
        return {
          title: "Time to vote!",
          subtitle: "Listen and choose your favorites",
        };
      case "celebration":
        return {
          title: "Submissions are open",
          subtitle: "Submit your cover before the listening party!",
        };
      default:
        return {
          title: song.title || "Round in progress",
          subtitle: song.artist || "Stay tuned for updates",
        };
    }
  };

  const heroContent = getHeroContent();

  const getButtonProps = (): ButtonProps[] => {
    if (!userId) {
      // Handle signed out user states
      if (phase === "voting" || phase === "covering") {
        const buttons: ButtonProps[] = [
          {
            text: "Join Waitlist",
            href: Navigation.Waitlist,
          }
        ];
        
        if (phase === "covering") {
          buttons.push({
            text: "Sign Up to Cover",
            href: signupLink,
          });
        }
        
        return buttons;
      }
      return [{
        text: "Sign up for the next round",
        href: signupLink,
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
              href: submitLink,
            },
            {
              text: "Sign up for Next Round",
              href: signupLink,
            },
          ];
        case "voting":
          return [{
            text: completedCheckByPhase.voting ? "Update Vote" : "Vote Now",
            href: Navigation.Voting,
          }];
        default:
          return [{
            text: "Round Details",
            href: `/round/${roundId}`,
          }];
      }
    }

    // User is signed in but not in current round
    if (phase === "voting" || phase === "covering") {
      const buttons: ButtonProps[] = [
        {
          text: "Join Waitlist",
          href: Navigation.Waitlist,
        }
      ];
      
      if (phase === "covering") {
        buttons.push({
          text: "Sign Up to Cover",
          href: signupLink,
        });
      }
      
      return buttons;
    }

    // Default case
    return [{
      text: "Round Details",
      href: `/round/${roundId}`,
    }];
  };

  const buttons = getButtonProps();

  return (
    <main className="flex flex-col space-y-16 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div className="max-w-2xl mb-8 md:mb-0">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
              creative fulfillment
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#40e2e2] to-[#e2e240]">
              with fewer decisions
            </span>
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg md:text-xl mb-8 leading-relaxed text-gray-300"
          >
           Sign up and suggest a song to cover. Everyone votes on the submitted cover candidates, and whichever song wins becomes the community&apos;s creative assignment - we all cover the same winning track. You&apos;ll have a clear deadline and be part of a community of musicians all tackling the same creative challenge.
          </motion.p>
            <JoinTheCreativeCommunity/>
        </div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 max-w-sm w-full"
        >
          <Badge
            variant="secondary"
            className="bg-[#e2e240] text-[#0a0a1e] mb-3"
          >
            {phase === "celebration" 
              ? "Next Round Signups Open"
              : phase === "covering" 
                ? "Now Covering" 
                : phase.charAt(0).toUpperCase() + phase.slice(1)}
          </Badge>
          <h3 className="text-2xl font-semibold text-gray-100 mb-2">
            {heroContent.title}
          </h3>
          <p className="text-lg text-gray-300 mb-4">
            {heroContent.subtitle}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            {userRoundDetails?.hasSignedUp
              ? signedUpBlurb
              : signupsAreOpenString}
          </p>
          <div className="flex flex-col space-y-2">
            {buttons.map((button, index) => (
              <Link key={index} href={button.href} passHref>
                <Button
                  className={`w-full ${
                    index === 0 
                      ? "bg-[#e2e240] text-[#0a0a1e] hover:bg-[#f0f050]"
                      : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                  }`}
                >
                  {button.text}
                </Button>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
};
