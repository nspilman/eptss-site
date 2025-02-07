"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from 'next/link';

export const HowItWorks = () => {
  const steps = [
    "Sign up and suggest a song to cover",
    "Help choose the winning track",
    "Create your unique cover",
    "Celebrate at our listening party"
  ];

  const features = [
    {
      icon: "🎵",
      title: "Growth Through Practice",
      description: "Push your musical boundaries with quarterly projects and supportive feedback"
    },
    {
      icon: "🎸",
      title: "Structured Progress",
      description: "Quarterly deadlines and peer accountability keep you motivated and improving"
    },
    {
      icon: "🎧",
      title: "Skill-Building Focus",
      description: "Each round is a new opportunity to tackle different musical challenges"
    },
    {
      icon: "✨",
      title: "Community Drive",
      description: "Let peer accountability and deadlines push you to finish what you start"
    }
  ];

  return (
    <div className="relative mt-16">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gray-900 opacity-95 backdrop-blur-md rounded-lg border border-gray-800"></div>
        
        <div className="absolute -inset-1 bg-gradient-to-r from-[#40e2e2] to-[#e2e240] rounded-lg blur opacity-15 pointer-events-none group-hover:opacity-25 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 px-8 md:px-24 py-16"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-100">
            Transform Songs, Together
          </h2>
          <p className="text-xl text-gray-100">
            Ever wondered how other musicians would interpret the same song?
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className="text-2xl">{feature.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.h3 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-2xl font-bold mb-6 text-gray-100"
        >
          How It Works
        </motion.h3>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
              className="flex items-center"
            >
              <div className="w-8 h-8 bg-[#e2e240] text-[#0a0a1e] rounded-full flex items-center justify-center mr-4 font-bold">
                {index + 1}
              </div>
              <p className="text-lg text-gray-300">{step}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="space-y-4 text-gray-300"
        >
          <p>
            Tired of putting off your musical goals? Join our community where quarterly deadlines and peer accountability keep you moving forward. Create your free account and help choose our next challenge song through community voting.
          </p>
          <p>
            Each round gives you three months to push your limits and create your cover. No more endless perfectionism - our deadline-driven approach helps you finish what you start, while our supportive community keeps you accountable and growing.
          </p>
          <p>
            New round starting soon - join now to transform your musical someday into today!
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="mt-8 space-x-4 flex flex-col items-center md:flex-row"
        >
          <Link href="/faq" passHref>
            <Button variant="outline" className="text-gray-900 hover:text-gray-100 hover:bg-[#e2e24040] flex items-center">
              FAQ
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/rounds" passHref>
            <Button variant="outline" className="text-gray-800 hover:text-gray-100 hover:bg-[#e2e24040] flex items-center">
              Past Rounds
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/sign-up" passHref>
            <Button className="bg-[#e2e240] text-[#0a0a1e] hover:bg-[#f0f050] flex items-center">
              Start Creating
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};