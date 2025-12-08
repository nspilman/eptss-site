"use client";

import React from 'react';
import { Button, Card, CardContent, SectionHeader, Animated, AnimatedList, AnimatedListItem } from "@eptss/ui";
import { ChevronRight, Lightbulb, Music, Share2, Calendar, Mic2, Heart } from "lucide-react";
import Link from 'next/link';

export const OriginalHowItWorks = () => {
  const steps = [
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Get Inspired",
      description: "Each month starts with a new theme or prompt to spark your creativity"
    },
    {
      icon: <Music className="w-5 h-5" />,
      title: "Write & Record",
      description: "Create your original song - lyrics, melody, and recording"
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: "Share & Celebrate",
      description: "Submit your work and celebrate with fellow songwriters"
    }
  ];

  const benefits = [
    {
      icon: <Calendar className="w-6 h-6 text-purple-400" />,
      title: "Monthly Momentum",
      description: "Regular deadlines help you develop a consistent songwriting practice"
    },
    {
      icon: <Mic2 className="w-6 h-6 text-pink-400" />,
      title: "Creative Freedom",
      description: "Any genre, any style - express yourself however you want"
    },
    {
      icon: <Heart className="w-6 h-6 text-blue-400" />,
      title: "Supportive Community",
      description: "Connect with other songwriters who celebrate your creative journey"
    }
  ];

  return (
    <div id="how-it-works" className="py-16 relative group">
      <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-lg blur opacity-15 pointer-events-none group-hover:opacity-25 group-hover:blur-lg transition duration-700"></div>
      <div className="relative">
        <div className="mb-12">
          <SectionHeader
            size="lg"
            align="center"
            title="How It Works"
            subtitle="A simple monthly process to nurture your songwriting"
          />
        </div>

        <Animated variant="fadeIn" duration={0.6} className="space-y-16">
        {/* Process Steps */}
        <AnimatedList variant="fadeInUp" staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <AnimatedListItem
              key={index}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mb-4 border-2 border-purple-500">
                <div className="text-purple-400">{step.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </AnimatedListItem>
          ))}
        </AnimatedList>

        {/* Benefits */}
        <div>
          <h3 className="text-2xl font-bold mb-8 text-center text-white">
            Why Songwriters Love This
          </h3>
          <AnimatedList variant="fadeInUp" staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} asChild className="bg-[var(--color-background-tertiary)] border-gray-700">
                <AnimatedListItem>
                  <CardContent>
                    <div className="mb-4">{benefit.icon}</div>
                    <h4 className="text-xl font-bold mb-2 text-white">{benefit.title}</h4>
                    <p className="text-gray-300">{benefit.description}</p>
                  </CardContent>
                </AnimatedListItem>
              </Card>
            ))}
          </AnimatedList>
        </div>

        {/* Testimonial */}
        <Card asChild className="max-w-3xl mx-auto bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700">
          <Animated variant="fadeInUp">
            <CardContent className="text-center py-8">
              <p className="text-xl italic text-gray-300 mb-4">
                "The monthly original song challenge has transformed my songwriting. Having a deadline and a community keeps me creating consistently."
              </p>
              <p className="text-purple-400 font-medium">— Sarah, Songwriter</p>
            </CardContent>
          </Animated>
        </Card>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link href="/sign-up" passHref>
            <Button variant="secondary" size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Join This Month
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="flex justify-center gap-6 mt-6">
            <Link href="/faq" className="text-[var(--color-gray-300)] hover:text-purple-400 transition-colors">
              FAQ
            </Link>
            <Link href="/rounds" className="text-[var(--color-gray-300)] hover:text-purple-400 transition-colors">
              Past Submissions
            </Link>
          </div>
        </div>
      </Animated>
      </div>
    </div>
  );
};
