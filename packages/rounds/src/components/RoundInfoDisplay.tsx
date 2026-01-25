"use client";

import { motion } from "framer-motion";
import React from "react";
import { RoundInfo } from "@eptss/core/types/round";
import { Card, CardContent } from "@eptss/ui";

export const RoundInfoDisplay = ({ roundInfo }: { roundInfo: RoundInfo | null }) => {
  if (!roundInfo) {
    return (
      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full bg-background-primary/60 backdrop-blur-sm border-gray-800 relative overflow-hidden">
          <CardContent>
            <div className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium shadow-sm"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
                border: '1px solid rgba(var(--color-accent-primary-rgb), 0.2)',
                color: 'var(--color-background-primary)'
              }}>
              Loading...
            </div>
            <h2 className="text-3xl font-bold text-primary relative z-10 uppercase">Loading...</h2>
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
          title: `Round ${roundInfo.roundId} Signups`,
          subtitle: "Join our next round",
          info: `Signups close ${roundInfo.dateLabels?.signups?.closes ? new Date(roundInfo.dateLabels.signups.closes).toLocaleDateString() : ''}`
        };
      case "voting":
        return {
          badge: "Voting Open",
          title: "Vote for the Next Song",
          subtitle: "Help choose our next cover",
          info: `Voting closes ${roundInfo.dateLabels?.voting?.closes ? new Date(roundInfo.dateLabels.voting.closes).toLocaleDateString() : ''}`
        };
      case "covering":
        return {
          badge: "Now Covering",
          title: roundInfo.song?.title || "Song Selected",
          subtitle: roundInfo.song?.artist ? `by ${roundInfo.song.artist}` : "",
          info: `Covers due ${roundInfo.dateLabels?.covering?.closes ? new Date(roundInfo.dateLabels.covering.closes).toLocaleDateString() : ''}`
        };
      case "celebration":
        return {
          badge: "Celebration Phase",
          title: roundInfo.song?.title || "Covers Complete",
          subtitle: roundInfo.song?.artist ? `by ${roundInfo.song.artist}` : "",
          info: `Celebration ends ${roundInfo.dateLabels?.celebration?.closes ? new Date(roundInfo.dateLabels.celebration.closes).toLocaleDateString() : ''}`
        };
      default:
        return {
          badge: "Round Info",
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
            className="w-full bg-background-primary/60 backdrop-blur-sm border-gray-800 relative overflow-hidden"
          >
            <CardContent>
              {/* Subtle gradient accent in the background */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl" style={{ backgroundColor: 'var(--color-accent-primary)' }} />

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="relative z-10"
              >
                <div className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium shadow-sm"
                  style={{
                    backgroundColor: 'var(--color-accent-primary)',
                    border: '1px solid rgba(var(--color-accent-primary-rgb), 0.2)',
                    color: 'var(--color-background-primary)'
                  }}>
                  {content.badge}
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-3xl font-bold text-primary relative z-10 uppercase"
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
                  {content.subtitle.includes('by ') ? (
                    <>by <span className="text-[var(--color-accent-primary)] font-medium">{content.subtitle.replace('by ', '')}</span></>
                  ) : (
                    content.subtitle
                  )}
                </motion.p>
              )}

              {content.info && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="text-sm text-gray-400 flex items-center gap-2 relative z-10"
                >
                  <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent-primary)' }} />
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
