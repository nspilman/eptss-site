"use client";

import { motion } from "framer-motion";
import { Hero } from "./index/Homepage/Hero";
import { RoundActionCard } from "./index/Homepage/RoundActionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import { Phase, UserRoundDetails } from "@/types";

interface Props {
    phase: Phase
    roundId: number
    phaseEndsDate: string
    phaseEndsDatelabel: string
    userRoundDetails?: UserRoundDetails
}

export const BodySection = ({ phase, roundId, phaseEndsDate, phaseEndsDatelabel, userRoundDetails}: Props) => {
    return (
    <>
    <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    className="flex flex-col md:flex-row md:items-center md:justify-between"
  >
    <div className="max-w-2xl mb-8 md:mb-0">
      <Hero />
    </div>
    <motion.div 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 max-w-sm w-full"
    >
      <RoundActionCard
        phase={phase}
        roundId={roundId}
        phaseEndsDate={phaseEndsDate}
        phaseEndsDatelabel={phaseEndsDatelabel}
        userRoundDetails={userRoundDetails}
      />
    </motion.div>
  </motion.div>
  <motion.div 
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.5, delay: 0.6 }}
  className="flex flex-col items-center space-y-6 max-w-3xl mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-8 border border-gray-700"
>
  <h3 className="text-2xl font-semibold text-gray-100 flex items-center">
    <Headphones className="mr-2 h-6 w-6 text-[#e2e240]" />
    Get notified for the next round
  </h3>
  <p className="text-center text-gray-300">
    Want in? Sign up with your email. It's free, and we do this every quarter.
  </p>
  <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
  </form>
</motion.div>
</>
)}