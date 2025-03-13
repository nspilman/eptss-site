"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Button, Card, CardHeader, CardTitle, CardContent, FeatureCard } from "@/components/ui/primitives";
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
    <Card gradient className="mt-16">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl md:text-4xl mb-4">
          Transform Songs, Together
        </CardTitle>
        <p className="text-xl text-gray-300">
          Ever wondered how other musicians would interpret the same song?
        </p>
      </CardHeader>
      
      <CardContent>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>

          {/* How It Works */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-gray-200">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center p-4 rounded-lg bg-gray-800/30 border border-gray-700/50"
                >
                  <div className="w-8 h-8 bg-[#e2e240] text-[#0a0a1e] rounded-full flex items-center justify-center mr-4 font-bold">
                    {index + 1}
                  </div>
                  <p className="text-lg text-gray-300">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 text-gray-300">
            <p>
              Tired of putting off your musical goals? Join our community where quarterly deadlines and peer accountability keep you moving forward. Create your free account and help choose our next challenge song through community voting.
            </p>
            <p>
              Each round gives you three months to push your limits and create your cover. No more endless perfectionism - our deadline-driven approach helps you finish what you start, while our supportive community keeps you accountable and growing.
            </p>
            <p>
              New round starting soon - join now to transform your musical someday into today!
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/faq" passHref>
              <Button variant="outline" className="w-full text-black md:w-auto">
                FAQ
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/rounds" passHref>
              <Button variant="outline" className="w-full text-black md:w-auto">
                Past Rounds
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-up" passHref>
              <Button className="w-full md:w-auto bg-[#e2e240] text-[#0a0a1e] hover:bg-[#f0f050]">
                Start Creating
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};