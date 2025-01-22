"use client"

import React from "react";
import { motion } from "framer-motion";
import { MusicIcon } from "lucide-react"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignupButton } from "@/components/NavButtons";
import { Navigation } from "@/enum/navigation";

interface Props {
  userId: string
}

  export const Header = ({userId}: Props) => {
  return (
    <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-12 md:mb-20 relative z-10"
      >
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center">
          <MusicIcon className="mr-2 h-8 w-8 text-[#e2e240]" />
          <Link href="/">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
            everyone plays the same song
          </span>
          </Link>
        </h1>
        <div className="space-x-2 md:space-x-4 flex">
          <Link href={Navigation.FAQ}>
          <Button variant="outline" className="text-sm md:text-base text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors">
            FAQ
          </Button>
          </Link>
          <SignupButton isLoggedIn={!!userId} />
        </div>
      </motion.nav>
    // <div id="header" className="backdrop-blur fixed top-0 left-0 w-full">
    //   <div className="py-4 px-4 md:px-8 flex items-center justify-center md:justify-between">
    //     <Link href={"/"}>
    //       <span className="md:text-xl font-fraunces font-semibold text-white cursor-pointer hover:text-themeYellow">
    //         everyone plays the same song
    //       </span>
    //     </Link>

    //     <div className="hidden spacing-x-2 lg:flex items-center justify-center">
    //       <FAQButton />
    //       <SignupButton isLoggedIn={!!userId} />
    //       {/* {current && next && <RoundDatesDisplayPopup {...{ current, next }} />} */}
    //     </div>
    //   </div>
    // </div>
  );
};
