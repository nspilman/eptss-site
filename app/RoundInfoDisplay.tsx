"use client";

import { motion } from "framer-motion";
import React from "react";
import { RoundInfo } from "@/types/round";

export const RoundInfoDisplay = ({ roundInfo }: { roundInfo: RoundInfo | null }) => {
  return (
    <div className="relative z-10 w-full max-w-md">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full bg-background-primary/60 rounded-xl p-8 backdrop-blur-sm border border-gray-800 shadow-xl relative overflow-hidden"
        >
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
              {roundInfo ? 'Now Covering' : 'Loading...'}
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-3xl font-bold text-primary relative z-10 uppercase"
          >
            {roundInfo?.song?.title || 'Loading song title...'}
          </motion.h2>
          
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-xl text-gray-300 mb-5 relative z-10"
          >
            by <span className="text-[var(--color-accent-primary)] font-medium">{roundInfo?.song?.artist || 'Loading artist...'}</span>
          </motion.p>
          
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-sm text-gray-400 flex items-center gap-2 relative z-10"
          >
            <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent-primary)' }} />
            {roundInfo ? `Round ${roundInfo.roundId} - covers due ${roundInfo.dateLabels?.celebration?.closes ? new Date(roundInfo.dateLabels.celebration.closes).toLocaleDateString() : ''}` : 'Loading round information...'}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
