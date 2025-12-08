"use client";

import { motion } from "framer-motion";
import React from "react";
import { RoundInfo } from "@eptss/data-access/types/round";
import { Card, CardContent } from "@eptss/ui";
import { Sparkles } from "lucide-react";

export const OriginalRoundInfo = ({ roundInfo }: { roundInfo: RoundInfo | null }) => {
  if (!roundInfo) {
    return (
      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm border-purple-700 relative overflow-hidden">
          <CardContent>
            <div className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium shadow-sm bg-purple-600 border border-purple-500 text-white">
              Loading...
            </div>
            <h2 className="text-3xl font-bold text-white relative z-10 uppercase">Loading...</h2>
            <p className="text-xl text-gray-300 mb-5 relative z-10">Please wait</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPhaseContent = () => {
    switch (roundInfo.phase) {
      case "signups":
        return {
          badge: "Signups Open",
          title: `This Month's Challenge`,
          subtitle: "Join the songwriting community",
          info: `Signups close ${roundInfo.dateLabels?.signups?.closes ? new Date(roundInfo.dateLabels.signups.closes).toLocaleDateString() : ''}`
        };
      case "voting":
        return {
          badge: "Theme Selection",
          title: "Vote for This Month's Theme",
          subtitle: "Help choose our creative prompt",
          info: `Voting closes ${roundInfo.dateLabels?.voting?.closes ? new Date(roundInfo.dateLabels.voting.closes).toLocaleDateString() : ''}`
        };
      case "covering":
        return {
          badge: "Creating Now",
          title: roundInfo.song?.title || "Write Your Original",
          subtitle: "Monthly songwriting challenge",
          info: `Submit by ${roundInfo.dateLabels?.covering?.closes ? new Date(roundInfo.dateLabels.covering.closes).toLocaleDateString() : ''}`
        };
      case "celebration":
        return {
          badge: "Celebrating",
          title: roundInfo.song?.title || "Songs Complete",
          subtitle: "Listen and celebrate together",
          info: `Celebration ends ${roundInfo.dateLabels?.celebration?.closes ? new Date(roundInfo.dateLabels.celebration.closes).toLocaleDateString() : ''}`
        };
      default:
        return {
          badge: "Original Songs",
          title: `Round ${roundInfo.roundId}`,
          subtitle: "",
          info: ""
        };
    }
  };

  const content = getPhaseContent();

  return (
    <div className="relative z-10 w-full max-w-md">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <Card asChild>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm border-purple-700 relative overflow-hidden"
          >
            <CardContent>
              {/* Artistic gradient accent */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl bg-gradient-to-br from-purple-600 to-pink-600 opacity-30" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-2xl bg-gradient-to-br from-blue-600 to-cyan-600 opacity-20" />

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="relative z-10"
              >
                <div className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium shadow-sm bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-500 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {content.badge}
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-3xl font-bold text-white relative z-10 uppercase"
              >
                {content.title}
              </motion.h2>

              {content.subtitle && (
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="text-xl text-gray-300 mb-5 relative z-10"
                >
                  {content.subtitle}
                </motion.p>
              )}

              {content.info && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="text-sm text-gray-400 flex items-center gap-2 relative z-10"
                >
                  <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-purple-400" />
                  {content.info}
                </motion.div>
              )}
            </CardContent>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};
