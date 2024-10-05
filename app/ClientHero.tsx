"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import React from "react";
import Link from "next/link";
import { EmailAuthModalContextProvider } from "@/components/client/context/EmailAuthModalContext";
import { JoinTheCreativeCommunity } from "./JoinTheCreativeCommunityButton";
import { Phase } from "@/types";
import { Navigation } from "@/enum/navigation";

type HeroActionsClientProps = {
  roundInfo: {
    roundId: number;
    phase: string;
    song: { title: string; artist: string };
    dateLabels: any;
    hasRoundStarted: boolean;
    areSubmissionsOpen: boolean;
  };
  userInfo: {
    userId: string | null;
    userRoundDetails: any;
  };
  nextRoundInfo: any;
  signedUpBlurb: string;
  signupLink: string;
  submitLink: string;
  songText: string;
  signupsAreOpenString: string;
};

export const ClientHero = ({
  songText,
  userInfo,
  roundInfo,
  signedUpBlurb,
  signupsAreOpenString,
  signupLink,
  submitLink,
}: HeroActionsClientProps) => {
  const { userRoundDetails, userId } = userInfo;
  const { song, roundId, phase } = roundInfo;

  const completedCheckByPhase: { [key in Phase]: boolean } = {
    signups: userRoundDetails?.hasSignedUp || false,
    covering: userRoundDetails?.hasSubmitted || false,
    voting: userRoundDetails?.hasVoted || false,
    celebration: userRoundDetails?.hasSubmitted || false,
  };

  const getButtonProps = () => {
    if (!userId) {
      return {
        text: "Sign up for the next round",
        href: signupLink,
      };
    }

    switch (phase) {
      case "signups":
        return {
          text: completedCheckByPhase.signups ? "Round Details" : "Join Round",
          href: completedCheckByPhase.signups ? `/round/${roundId}` : signupLink,
        };
      case "covering":
        return {
          text: completedCheckByPhase.covering ? "Update Submission" : "Submit Cover",
          href: submitLink,
        };
      case "voting":
        return {
          text: completedCheckByPhase.voting ? "Update Vote" : "Vote Now",
          href: Navigation.Voting,
        };
      case "celebration":
        return {
          text: "View Results",
          href: `/round/${roundId}`,
        };
      default:
        return {
          text: "Round Details",
          href: `/round/${roundId}`,
        };
    }
  };

  const buttonProps = getButtonProps();

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
            Sign up with a song you want to cover. Everyone votes, and the most
            popular is the song that everyone plays. You&apos;ve got a creative
            assignment, a deadline and a community of musicians doing the same
            thing.
          </motion.p>
          <EmailAuthModalContextProvider>
            <JoinTheCreativeCommunity/>
          </EmailAuthModalContextProvider>
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
            {songText
              ? "Now Covering"
              : userId
              ? "Round Status"
              : "Get Started"}
          </Badge>
          <h3 className="text-2xl font-semibold text-gray-100 mb-2">
            {song.title || "Join the next round"}
          </h3>
          <p className="text-lg text-gray-300 mb-4">
            {song.artist || "Be part of our creative community"}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            {userRoundDetails?.hasSignedUp
              ? signedUpBlurb
              : signupsAreOpenString}
          </p>
          <div className="flex flex-col space-y-2">
            <Link href={buttonProps.href} passHref>
              <Button
                className="w-full bg-[#e2e240] text-[#0a0a1e] hover:bg-[#f0f050]"
              >
                {buttonProps.text}
              </Button>
            </Link>
            {/* Remove or adjust the second button as needed */}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
};
