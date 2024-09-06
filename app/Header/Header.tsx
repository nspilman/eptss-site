"use client";

import React from "react";
import { MusicIcon } from "lucide-react";
import { motion } from "framer-motion";
import { SignupButton } from "../index/Homepage/SignupButton";
import { FAQButton } from "components/NavButtons";

interface Props {
  userId: string
}

export const Header = ({userId}: Props) => {

  return (
    <motion.nav 
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex justify-between items-center mb-12 md:mb-4 relative z-10"
  >
    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center">
      <MusicIcon className="mr-2 h-8 w-8 text-[#e2e240]" />
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
        everyone plays the same song
      </span>
    </h1>
    <div className="space-x-2 md:space-x-4">
    <FAQButton />
    <SignupButton isLoggedIn={!!userId} />
    </div>
  </motion.nav>
  );
};