"use client";

import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, FeatureCard, SectionHeader, Animated, AnimatedList, AnimatedListItem } from "@eptss/ui";
import { ChevronRight, Music, Calendar, Users, Award } from "lucide-react";
import Link from 'next/link';

export const HowItWorks = () => {
  const steps = [
    {
      icon: <Music className="w-5 h-5" />,
      title: "Choose a Song",
      description: "Suggest songs and vote on what we&apos;ll cover next"
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
      icon: <Award className="w-6 h-6 text-[var(--color-accent-primary)]" />,
      title: "Creative Freedom",
      description: "Express yourself without the pressure of choosing what to create"
    },
    {
      icon: <Calendar className="w-6 h-6 text-[var(--color-accent-primary)]" />,
      title: "Structured Deadlines",
      description: "Quarterly projects with clear timelines keep you moving forward"
    },
    {
      icon: <Users className="w-6 h-6 text-[var(--color-accent-primary)]" />,
      title: "Supportive Community",
      description: "Connect with fellow musicians who understand your creative journey"
    }
  ];

  return (
    <div id="how-it-works" className="py-16 relative group">
      <div className="absolute -inset-2 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] rounded-lg blur opacity-15 pointer-events-none group-hover:opacity-25 group-hover:blur-lg transition duration-700"></div>
      <div className="relative">
        <div className="mb-12">
          <SectionHeader
            size="lg"
            align="center"
            title="How It Works"
            subtitle="A simple process designed to spark your creativity"
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
              <div className="w-16 h-16 bg-[var(--color-gray-800)] rounded-full flex items-center justify-center mb-4 border-2 border-[var(--color-accent-primary)]">
                <div className="text-[var(--color-accent-primary)]">{step.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </AnimatedListItem>
          ))}
        </AnimatedList>

        {/* Benefits */}
        <div>
          <h3 className="text-2xl font-bold mb-8 text-center text-white">
            Why Musicians Love Us
          </h3>
          <AnimatedList variant="fadeInUp" staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} asChild>
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
        <Card asChild className="max-w-3xl mx-auto">
          <Animated variant="fadeInUp">
            <CardContent className="text-center py-8">
              <p className="text-xl italic text-gray-300 mb-4">
              &quot;Everyone Plays the Same Song provides the community and direction I&apos;ve needed to consistently make music and improve for the last two years.&quot;
              </p>
              <p className="text-[var(--color-accent-primary)] font-medium">— David, Participant</p>
            </CardContent>
          </Animated>
        </Card>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link href="/sign-up" passHref>
            <Button variant="secondary" size="lg">
              Join Our Next Round
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="flex justify-center gap-6 mt-6">
            <Link href="/faq" className="text-[var(--color-gray-300)] hover:text-[var(--color-accent-primary)] transition-colors">
              FAQ
            </Link>
            <Link href="/rounds" className="text-[var(--color-gray-300)] hover:text-[var(--color-accent-primary)] transition-colors">
              Past Rounds
            </Link>
          </div>
        </div>
      </Animated>
      </div>
    </div>
  );
};