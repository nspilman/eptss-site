"use client";

import { Button } from "@/components/ui/button";
import { UserRoundDetails } from "@/types";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Props {
    signupLink: string;
    submitLink: string;
    songText: string;
    signedUpBlurb: string;
    signupsAreOpenString: string;
    userId: string | null;
    userRoundDetails?: UserRoundDetails;
    roundNumber: number;
    dueDate: string;
}

export const HeroClientActions = ({
    signupLink,
    submitLink,
    songText,
    signedUpBlurb,
    signupsAreOpenString,
    userId,
    userRoundDetails,
    roundNumber,
    dueDate,
}: Props) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all max-w-sm w-full"
    >
        <Badge variant="secondary" className="bg-[#e2e240] text-[#0a0a1e] mb-3">
            Now Covering
        </Badge>
        <h3 className="text-2xl font-semibold text-gray-100 mb-2">{songText.split(" by ")[0]}</h3>
        <p className="text-lg text-gray-300 mb-4">by {songText.split(" by ")[1]}</p>
        <p className="text-sm text-gray-400 mb-4">Round {roundNumber} - covers due {dueDate}</p>
        <div className="flex space-x-4">
            <Button 
                className="flex-1 bg-white text-[#0a0a1e] hover:bg-gray-200 transition-colors"
                onClick={() => window.location.href = submitLink}
            >
                Submit your cover
            </Button>
        </div>
    </motion.div>
)