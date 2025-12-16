"use client";

import { Button, Display, Text, Label } from "@eptss/ui";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Mic, Palette } from "lucide-react";

interface ProjectHeroProps {
  projectSlug: string;
  content: {
    tagline: string;
    title: string;
    subtitle: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    benefits: string;
  };
}

export const ProjectHero = ({ projectSlug, content }: ProjectHeroProps) => {
  return (
    <div className="max-w-2xl md:mb-0 flex flex-col items-center md:items-start relative">
      {/* Decorative elements */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.01 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-[var(--color-accent-primary)]" />
          <Label size="sm" color="accent" className="uppercase tracking-wide">
            {content.tagline}
          </Label>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.02 }}
        className="text-center md:text-left mb-6 relative z-10"
      >
        <Display size="lg" className="block mb-2">
          {content.title}
        </Display>
        <Display size="lg" gradient className="block">
          {content.subtitle}
        </Display>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.03 }}
        className="mb-8 text-center md:text-left relative z-10"
      >
        <Text size="xl" color="tertiary">
          {content.description}
        </Text>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.04 }}
        className="flex flex-col sm:flex-row gap-4 items-center md:items-start relative z-10"
      >
        <Link href={`/projects/${projectSlug}/sign-up`}>
          <Button variant="default" size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Mic className="mr-2 h-5 w-5" />
            {content.ctaPrimary}
          </Button>
        </Link>
        <Link href="#how-it-works">
          <Button variant="outline" size="lg">
            <Palette className="mr-2 h-5 w-5" />
            {content.ctaSecondary}
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mt-6 text-center md:text-left relative z-10"
      >
        <Text size="sm" color="secondary">
          {content.benefits}
        </Text>
      </motion.div>
    </div>
  );
};
