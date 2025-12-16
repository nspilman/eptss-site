"use client";

import { motion } from "framer-motion";
import React from "react";
import { RoundInfo } from "@eptss/data-access/types/round";
import { RoundInfoLabels } from "@eptss/project-config";
import { Card, CardContent, Badge, Heading, Text } from "@eptss/ui";
import { Sparkles } from "lucide-react";

interface RoundInfoCardProps {
  roundInfo: RoundInfo | null;
  labels: RoundInfoLabels;
}

export const RoundInfoCard = ({ roundInfo, labels }: RoundInfoCardProps) => {
  if (!roundInfo) {
    return (
      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full bg-gradient-to-br from-[var(--color-accent-secondary)]/40 to-[var(--color-accent-primary)]/40 backdrop-blur-sm border-[var(--color-accent-primary)] relative overflow-hidden">
          <CardContent>
            <Badge className="mb-4 bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)]">
              {labels.loading.badge}
            </Badge>
            <Heading size="lg" className="uppercase mb-2">{labels.loading.title}</Heading>
            <Text size="xl" color="tertiary">{labels.loading.subtitle}</Text>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPhaseContent = () => {
    switch (roundInfo.phase) {
      case "signups":
        return {
          badge: labels.signups.badge,
          title: labels.signups.title,
          subtitle: labels.signups.subtitle,
          info: `${labels.signups.closesPrefix} ${roundInfo.dateLabels?.signups?.closes ? new Date(roundInfo.dateLabels.signups.closes).toLocaleDateString() : ''}`
        };
      case "voting":
        return {
          badge: labels.voting.badge,
          title: labels.voting.title,
          subtitle: labels.voting.subtitle,
          info: `${labels.voting.closesPrefix} ${roundInfo.dateLabels?.voting?.closes ? new Date(roundInfo.dateLabels.voting.closes).toLocaleDateString() : ''}`
        };
      case "covering":
        return {
          badge: labels.covering.badge,
          title: roundInfo.song?.title || labels.covering.titleFallback,
          subtitle: labels.covering.subtitle,
          info: `${labels.covering.closesPrefix} ${roundInfo.dateLabels?.covering?.closes ? new Date(roundInfo.dateLabels.covering.closes).toLocaleDateString() : ''}`
        };
      case "celebration":
        return {
          badge: labels.celebration.badge,
          title: roundInfo.song?.title || labels.celebration.titleFallback,
          subtitle: labels.celebration.subtitle,
          info: `${labels.celebration.closesPrefix} ${roundInfo.dateLabels?.celebration?.closes ? new Date(roundInfo.dateLabels.celebration.closes).toLocaleDateString() : ''}`
        };
      default:
        return {
          badge: labels.loading.badge,
          title: `Round ${roundInfo.roundId}`,
          subtitle: "",
          info: ""
        };
    }
  };

  const content = getPhaseContent();

  return (
    <div className="relative z-10 w-full max-w-md">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <Card asChild>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full bg-gradient-to-br from-[var(--color-accent-secondary)]/40 to-[var(--color-accent-primary)]/40 backdrop-blur-sm border-[var(--color-accent-primary)] relative overflow-hidden"
          >
            <CardContent>
              {/* Artistic gradient accent */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl bg-gradient-to-br from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] opacity-30" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-2xl bg-gradient-to-br from-blue-600 to-cyan-600 opacity-20" />

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="relative z-10"
              >
                <Badge className="mb-4 inline-flex items-center gap-1 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] border-[var(--color-accent-primary)]">
                  <Sparkles className="w-3 h-3" />
                  {content.badge}
                </Badge>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="relative z-10"
              >
                <Heading size="lg" className="uppercase mb-2">
                  {content.title}
                </Heading>
              </motion.div>

              {content.subtitle && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="relative z-10 mb-5"
                >
                  <Text size="xl" color="tertiary">
                    {content.subtitle}
                  </Text>
                </motion.div>
              )}

              {content.info && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="relative z-10"
                >
                  <Text size="sm" color="secondary" className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-[var(--color-accent-primary)]" />
                    {content.info}
                  </Text>
                </motion.div>
              )}
            </CardContent>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};
