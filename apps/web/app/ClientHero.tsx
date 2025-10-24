"use client";

import { motion } from "framer-motion";
import React from "react";
import { Phase, RoundInfo } from "@eptss/data-access/types/round";

type ClientHeroProps = {
  roundInfo: RoundInfo | null;
};

export const ClientHero = ({
  roundInfo,
}: ClientHeroProps) => {
  const { song, roundId } = roundInfo || {
    song: { title: '', artist: '' },
    roundId: null
  };
  
  // This component is now informational only - displays current round info

  return (
    <div className="relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-900/60 rounded-xl p-8 backdrop-blur-sm border border-gray-800 shadow-xl max-w-md"
        >
          {song.title ? (
            <>
              <div className="mb-4 inline-flex items-center rounded-full border border-transparent bg-accent-primary text-background-primary px-3 py-1 text-sm font-medium">
                Now Covering
              </div>
              <h2 className="text-3xl font-bold mb-3 text-white">
                {song.title}
              </h2>
              <p className="text-xl text-gray-300 mb-4">
                by <span className="text-accent-primary">{song.artist}</span>
              </p>
              <div className="text-sm text-gray-400 mb-6 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-accent-primary" />
                {roundInfo ? `Round ${roundId} - covers due ${new Date(roundInfo.dateLabels.celebration.closes).toLocaleDateString()}` : 'Next round dates to be announced'}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 inline-flex items-center rounded-full border border-transparent bg-accent-primary text-background-primary px-3 py-1 text-sm font-medium">
                Coming Soon
              </div>
              <h2 className="text-3xl font-bold mb-3 text-white">
                Next Round
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Join us for our next creative challenge!
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

