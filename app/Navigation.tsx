"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MusicIcon} from "lucide-react"

export const Navigation = () => (
        <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center my-8 md:my-5 relative z-10"
      >
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center">
          <MusicIcon className="mr-2 h-8 w-8 text-[#e2e240]" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
            everyone plays the same song
          </span>
        </h1>
        <div className="space-x-2 md:space-x-4">
          <Button variant="outline" className="text-sm md:text-base text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors">
            FAQ
          </Button>
          <Button variant="outline" className="text-sm md:text-base text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors">
            Sign up / Log In!
          </Button>
        </div>
      </motion.nav>
    )