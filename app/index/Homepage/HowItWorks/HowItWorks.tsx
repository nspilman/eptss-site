"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Button, Card, CardHeader, CardTitle, CardContent, FeatureCard } from "@/components/ui/primitives";
import { ChevronRight, Music, Calendar, Users, Award } from "lucide-react";
import Link from 'next/link';

export const HowItWorks = () => {
  const steps = [
    {
      icon: <Music className="w-5 h-5" />,
      title: "Choose a Song",
      description: "Suggest songs and vote on what we'll cover next"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Create Your Version",
      description: "Three months to record your unique interpretation"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Share & Connect",
      description: "Join our listening party and celebrate together"
    }
  ];

  const benefits = [
    {
      icon: <Award className="w-6 h-6 text-[#e2e240]" />,
      title: "Creative Freedom",
      description: "Express yourself without the pressure of choosing what to create"
    },
    {
      icon: <Calendar className="w-6 h-6 text-[#e2e240]" />,
      title: "Structured Deadlines",
      description: "Quarterly projects with clear timelines keep you moving forward"
    },
    {
      icon: <Users className="w-6 h-6 text-[#e2e240]" />,
      title: "Supportive Community",
      description: "Connect with fellow musicians who understand your creative journey"
    }
  ];

  return (
    <div id="how-it-works" className="py-16 relative group">
      <div className="absolute -inset-2 bg-gradient-to-r from-[#40e2e2] to-[#e2e240] rounded-lg blur opacity-15 pointer-events-none group-hover:opacity-25 group-hover:blur-lg transition duration-700"></div>
      <div className="relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A simple process designed to spark your creativity
          </p>
        </div>
        
        <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="space-y-16"
      >
        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border-2 border-[#e2e240]">
                <div className="text-[#e2e240]">{step.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <div>
          <h3 className="text-2xl font-bold mb-8 text-center text-white">
            Why Musicians Love Us
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/40 p-6 rounded-lg border border-gray-800"
              >
                <div className="mb-4">{benefit.icon}</div>
                <h4 className="text-xl font-bold mb-2 text-white">{benefit.title}</h4>
                <p className="text-gray-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-900/30 p-8 rounded-lg border border-gray-800 max-w-3xl mx-auto text-center"
        >
          <p className="text-xl italic text-gray-300 mb-4">
          "Everyone Plays the Same Song provides the community and direction I've needed to consistently make music and improve for the last two years."
          </p>
          <p className="text-[#e2e240] font-medium">— David, Participant</p>
        </motion.div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link href="/sign-up" passHref>
            <Button variant="secondary" size="lg">
              Join Our Next Round
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="flex justify-center gap-6 mt-6">
            <Link href="/faq" className="text-gray-300 hover:text-[#e2e240] transition-colors">
              FAQ
            </Link>
            <Link href="/rounds" className="text-gray-300 hover:text-[#e2e240] transition-colors">
              Past Rounds
            </Link>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};