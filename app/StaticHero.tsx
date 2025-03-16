"use client";

import { Button } from "@/components/ui/primitives";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@/enum/navigation";

export const StaticHero = () => {
  return (
    <div className="max-w-2xl md:mb-0 flex flex-col items-center md:items-start">
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.01 }}
        className="text-center md:text-left mb-6"
      >
        <span className="text-4xl sm:text-6xl text-white">
          Make Music <span className="text-[var(--color-accent-primary)]">Together</span>
        </span>
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.02 }}
        className="text-xl text-gray-300 mb-8 text-center md:text-left"
      >
        One song, every quarter. Your unique version. A community of musicians.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.03 }}
        className="flex flex-col items-center md:items-start"
      >
        <Link href={Navigation.SignUp}>
          <Button variant="default" size="lg">
            Join Next Round
          </Button>
        </Link>
        <div className="text-sm text-gray-400 mt-2 text-center md:text-left">No commitment required</div>
      </motion.div>
    </div>
  );
};
