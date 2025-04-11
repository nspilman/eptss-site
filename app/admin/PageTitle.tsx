"use client"
import { motion } from "framer-motion"

export const PageTitle = ({ roundId, title }: { roundId?: number; title?: string }) => (
  <motion.h1 
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary"
  >
    {title || (roundId ? `Admin Dashboard - Round ${roundId}` : "Admin Dashboard")}
  </motion.h1>
)