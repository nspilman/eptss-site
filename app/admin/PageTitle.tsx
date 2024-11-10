"use Client"
import { motion } from "framer-motion"

export const PageTitle = ({ roundId }: { roundId: number }) => (
  <motion.h1 
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]"
  >
    Admin Dashboard - Round {roundId}
  </motion.h1>
)