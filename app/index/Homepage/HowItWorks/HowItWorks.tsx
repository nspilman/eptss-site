"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from 'next/link';

export const HowItWorks = () => {
  const steps = [
    "Sign up with the song you want to cover",
    "Vote on your favorite cover options",
    "Cover the song that wins",
    "Celebrate with your peers"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative px-8 md:px-24 py-16 bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-lg border border-gray-800"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-[#40e2e2] to-[#e2e240] rounded-lg blur opacity-25 pointer-events-none group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
      
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-3xl md:text-4xl font-bold mb-6 text-gray-100"
      >
        How It Works
      </motion.h2>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            className="flex items-center mb-4"
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
        transition={{ duration: 0.5, delay: 0.9 }}
        className="space-y-4 text-gray-300"
      >
        <p>
          Everyone Plays the Same Song is a community project open to musicians of all skill levels, inviting participants to cover the same song each round.
        </p>
        <p>
          Sign up by creating an account and submit the song you'd like to cover for the upcoming round. Songs are chosen based on participant voting, using a scale from 1 (not interested in covering) to 5 (very interested in covering). Once the song is selected, you will have just over a month to submit your SoundCloud cover link. The fun doesn't stop there - after submission, we compile all covers into a playlist for a communal listening party.
        </p>
        <p>
          No special equipment or software is required - just your passion for music. You choose which rounds to participate in, allowing you to be part of the song selection and music-making process as per your interest and convenience. Join us for a celebration of music and community! We can't wait to hear your interpretation of... the same song!
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="mt-8 space-x-4 flex"
      >
        <Link href="/faq" passHref>
          <Button variant="outline" className="text-gray-800 hover:text-gray-100 hover:bg-[#e2e24040] flex items-center">
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
        <Link href="/signup" passHref>
          <Button className="bg-[#e2e240] text-[#0a0a1e] hover:bg-[#f0f050] flex items-center">
            Sign Up
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
};