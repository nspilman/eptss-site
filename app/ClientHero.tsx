"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import React from "react";
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
        title: "Everyone Plays The Same Song",
        subtitle: "Join a community of musicians covering one song each quarter. We vote together, create together, and celebrate together.",
      };
    }

    switch (phase) {
      case "signups":
        return {
          title: song.title ? `Next Up: ${song.title}` : "Song Selection in Progress",
          subtitle: song.artist ? `Get ready to reimagine ${song.artist}&apos;s track` : "Help us choose our next creative challenge",
        };
      case "covering":
        return {
          title: `Now Covering: ${song.title}`,
          subtitle: `Join the musicians creating unique versions of ${song.artist}&apos;s track`,
        };
      case "voting":
        return {
          title: "Community Listening Party",
          subtitle: `Experience everyone's unique take on ${song.title} and cast your votes`,
        };
      case "celebration":
        return {
          title: "Round ${roundId} Showcase",
          subtitle: "Get ready to hear how everyone reimagined this quarter&apos;s song",
        };
      default:
        return {
          title: song.title ? `Current Project: ${song.title}` : "Round in Progress",
          subtitle: song.artist ? `Join our community reimagining ${song.artist}&apos;s track` : "New creative challenge starting soon",
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
    <main className="flex flex-col space-y-6 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mt-8"
      >
        <div className="max-w-2xl md:mb-0 flex flex-col items-center md:items-start">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-bold mb-4 leading-tight"
          >
            <span className="text-3xl sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
              creative fulfillment
            </span>
            <br />
            <span className="text-2xl sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-[#40e2e2] to-[#e2e240]">
              with fewer decisions
            </span>
          </motion.h1>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6 text-xl leading-relaxed text-gray-300"
          >
            <ol className="list-none space-y-2">
              <li className="text-sm md:text-xl flex items-center gap-4">
                <div className="flex items-center justify-center w-4 h-4 md:w-8 md:h-8 rounded-full border-2 border-[#e2e240]">
                  <span className="text-[#e2e240] text-xs md:text-sm">1</span>
                </div>
                Suggest and vote on songs to cover
              </li>
              <li className="text-sm md:text-xl flex items-center gap-4">
                <div className="flex items-center justify-center w-4 h-4 md:w-8 md:h-8 rounded-full border-2 border-[#e2e240]">
                  <span className="text-[#e2e240] text-xs md:text-sm">2</span>
                </div>
                Create your version of the winning track
              </li>
              <li className="text-sm md:text-xl flex items-center gap-4">
                <div className="flex items-center justify-center w-4 h-4 md:w-8 md:h-8 rounded-full border-2 border-[#e2e240]">
                  <span className="text-[#e2e240] text-xs md:text-sm">3</span>
                </div>
                Share and celebrate with the community
              </li>
            </ol>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10"
          >
            <Button className="w-fit bg-[#e2e240] text-gray-900 hover:bg-[#e2e240]/90 px-6 mb-2">
              Get notified about the next round
            </Button>
            <div className="text-sm text-gray-300">No commitment required</div>
          </motion.div>
        </div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full md:w-[380px] bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-800"
        >
          <Badge className="mb-4 bg-[#e2e240] text-gray-900 hover:bg-[#e2e240]">
            Now Covering
          </Badge>
          <h2 className="text-2xl font-bold mb-2 text-[#e2e240]">
            {song.title}
          </h2>
          <p className="text-gray-300 mb-4">
            Join the musicians creating unique versions of {song.artist}&apos;s track
          </p>
          <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#e2e240]" />
            Round {roundId} - covers are due {new Date(roundInfo.dateLabels.celebration.closes).toLocaleDateString()}
          </div>
          <div className="space-y-3">
            <Button className="w-full bg-[#e2e240] text-gray-900 hover:bg-[#e2e240]/90">
              Submit Cover
            </Button>
            <Button variant="secondary" className="w-full">
              Sign up for Next Round
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
};
