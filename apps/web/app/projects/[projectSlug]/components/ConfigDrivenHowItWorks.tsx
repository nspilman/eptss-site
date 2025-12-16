"use client";

import React from 'react';
import { Button, Card, CardContent, SectionHeader, Animated, AnimatedList, AnimatedListItem, FeatureCard, Heading, Text, Quote } from "@eptss/ui";
import { ChevronRight, Lightbulb, Music, Calendar, Users, Award, Mic, Heart, Sparkles } from "lucide-react";
import Link from 'next/link';
import { HowItWorks } from '@eptss/project-config';

interface ConfigDrivenHowItWorksProps {
  content: HowItWorks;
  projectSlug: string;
}

// Icon mapping for config-driven icons
const iconMap = {
  music: Music,
  lightbulb: Lightbulb,
  calendar: Calendar,
  users: Users,
  mic: Mic,
  award: Award,
  heart: Heart,
  sparkles: Sparkles,
} as const;

export const ConfigDrivenHowItWorks = ({ content, projectSlug }: ConfigDrivenHowItWorksProps) => {
  const steps = [
    {
      icon: content.steps.step1.icon,
      title: content.steps.step1.title,
      description: content.steps.step1.description,
    },
    {
      icon: content.steps.step2.icon,
      title: content.steps.step2.title,
      description: content.steps.step2.description,
    },
    {
      icon: content.steps.step3.icon,
      title: content.steps.step3.title,
      description: content.steps.step3.description,
    },
  ];

  const benefits = [
    {
      icon: content.benefits.benefit1.icon,
      title: content.benefits.benefit1.title,
      description: content.benefits.benefit1.description,
    },
    {
      icon: content.benefits.benefit2.icon,
      title: content.benefits.benefit2.title,
      description: content.benefits.benefit2.description,
    },
    {
      icon: content.benefits.benefit3.icon,
      title: content.benefits.benefit3.title,
      description: content.benefits.benefit3.description,
    },
  ];

  const getStepIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Music;
    return <IconComponent className="w-5 h-5" />;
  };

  const getBenefitIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Award;
    return <IconComponent className="w-6 h-6 text-[var(--color-accent-primary)]" />;
  };

  return (
    <div id="how-it-works" className="py-16 relative group">
      <div className="absolute -inset-2 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] rounded-lg blur opacity-15 pointer-events-none group-hover:opacity-25 group-hover:blur-lg transition duration-700"></div>
      <div className="relative">
        <div className="mb-12">
          <SectionHeader
            size="lg"
            align="center"
            title={content.sectionTitle}
            subtitle={content.sectionSubtitle}
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
                  <div className="text-[var(--color-accent-primary)]">{getStepIconComponent(step.icon)}</div>
                </div>
                <Heading size="lg" className="mb-2">{step.title}</Heading>
                <Text color="tertiary">{step.description}</Text>
              </AnimatedListItem>
            ))}
          </AnimatedList>

          {/* Benefits */}
          <div>
            <Heading size="lg" className="mb-8 text-center">
              {content.benefits.benefitsTitle}
            </Heading>
            <AnimatedList variant="fadeInUp" staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <AnimatedListItem key={index}>
                  <FeatureCard
                    icon={getBenefitIconComponent(benefit.icon)}
                    title={benefit.title}
                    description={benefit.description}
                  />
                </AnimatedListItem>
              ))}
            </AnimatedList>
          </div>

          {/* Testimonial */}
          <Card asChild className="max-w-3xl mx-auto bg-gradient-to-br from-[var(--color-accent-secondary)]/20 to-[var(--color-accent-primary)]/20 border-[var(--color-accent-primary)]/50">
            <Animated variant="fadeInUp">
              <CardContent className="text-center py-8">
                <Quote className="text-xl mb-4">
                  {content.testimonial.quote}
                </Quote>
                <Text color="accent" weight="medium">— {content.testimonial.author}</Text>
              </CardContent>
            </Animated>
          </Card>

          {/* CTA */}
          <div className="text-center pt-4">
            <Link href={`/projects/${projectSlug}/sign-up`} passHref>
              <Button variant="secondary" size="lg" className="bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] hover:opacity-90">
                {content.ctaButton}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <div className="flex justify-center gap-6 mt-6">
              <Link href="/faq">
                <Text color="tertiary" className="hover:text-[var(--color-accent-primary)] transition-colors">
                  {content.ctaLinks.faq}
                </Text>
              </Link>
              <Link href="/rounds">
                <Text color="tertiary" className="hover:text-[var(--color-accent-primary)] transition-colors">
                  {content.ctaLinks.pastRounds}
                </Text>
              </Link>
            </div>
          </div>
        </Animated>
      </div>
    </div>
  );
};
