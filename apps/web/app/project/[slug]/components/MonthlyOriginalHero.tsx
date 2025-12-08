"use client";

import { Button } from "@eptss/ui";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@eptss/shared";
import { Sparkles, Mic, Palette } from "lucide-react";

export const MonthlyOriginalHero = () => {
  return (
    <div className="max-w-2xl md:mb-0 flex flex-col items-center md:items-start relative">
      {/* Decorative elements */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.01 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-[var(--color-accent-primary)]" />
          <span className="text-sm font-semibold text-[var(--color-accent-primary)] uppercase tracking-wide">
            Monthly Songwriting Challenge
          </span>
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.02 }}
        className="text-center md:text-left mb-6 relative z-10"
      >
        <span className="text-4xl sm:text-6xl text-[var(--color-white)] block mb-2">
          Create Your Own
        </span>
        <span className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Original Song
        </span>
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.03 }}
        className="text-xl text-[var(--color-gray-300)] mb-8 text-center md:text-left relative z-10"
      >
        Every month, write and record an original song. Share your creativity
        with a supportive community of songwriters and musicians.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.04 }}
        className="flex flex-col sm:flex-row gap-4 items-center md:items-start relative z-10"
      >
        <Link href={Navigation.SignUp}>
          <Button variant="default" size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Mic className="mr-2 h-5 w-5" />
            Start Creating
          </Button>
        </Link>
        <Link href="#how-it-works">
          <Button variant="outline" size="lg">
            <Palette className="mr-2 h-5 w-5" />
            Learn More
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mt-6 text-sm text-[var(--color-gray-400)] text-center md:text-left relative z-10"
      >
        No experience required • All genres welcome • Free to join
      </motion.div>
    </div>
  );
};
