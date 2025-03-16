"use client";

import React from "react";
import { motion } from "framer-motion";

export const BackgroundPattern = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1e] via-[#0a0a1e] to-[#0f0f2e]" />
      
      {/* Animated dots pattern */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(#e2e240 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      
      {/* Glow effect */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-[#e2e240] opacity-5 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-[#40e2e2] opacity-5 blur-[150px] rounded-full" />
    </div>
  );
};

export default BackgroundPattern;
