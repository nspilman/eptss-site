"use client";

import { Card, CardContent, Badge, SectionHeader, Animated, AnimatedList, AnimatedListItem, EmptyState, Heading, Text } from "@eptss/ui";
import { Music, Calendar, User, ExternalLink } from "lucide-react";
import { SubmissionsGallery as SubmissionsGalleryConfig } from "@eptss/project-config";
import Link from "next/link";
import { motion } from "framer-motion";
import { routes } from "@eptss/routing";
import { useRouteParams } from "../ProjectContext";

interface Submission {
  title: string;
  artist: string;
  roundId: number;
  slug: string;
  submissionCount?: number;
  startDate?: string;
}

interface SubmissionsGalleryProps {
  submissions: Submission[];
  content: SubmissionsGalleryConfig;
}

export const SubmissionsGallery = ({ submissions, content }: SubmissionsGalleryProps) => {
  const { projectSlug } = useRouteParams();

  // Format date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  if (!submissions || submissions.length === 0) {
    return (
      <div className="py-16">
        <SectionHeader
          size="lg"
          align="center"
          title={content.title}
          subtitle={content.emptyStateTitle}
        />
        <Card className="max-w-md mx-auto mt-8 bg-[var(--color-background-tertiary)] border-[var(--color-accent-primary)]/50">
          <CardContent>
            <EmptyState
              size="lg"
              icon={<Music className="text-[var(--color-accent-primary)]" />}
              description={
                <Text size="lg" color="tertiary">
                  {content.emptyStateMessage}
                </Text>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-16 bg-[var(--color-background-secondary)] rounded-xl">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeader
          size="lg"
          align="center"
          title={content.title}
          subtitle={content.subtitle}
        />

        <AnimatedList variant="fadeInUp" staggerDelay={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {submissions.map((submission, index) => (
            <AnimatedListItem key={submission.roundId}>
              <Link href={routes.projects.rounds.detail(projectSlug, submission.slug)}>
                <Card
                  className="h-full bg-gradient-to-br from-[var(--color-accent-secondary)]/20 to-[var(--color-accent-primary)]/20 border-[var(--color-accent-primary)]/50 hover:border-[var(--color-accent-primary)] transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-[var(--color-accent-primary)]/50 text-white border-[var(--color-accent-primary)]">
                        Round {submission.roundId}
                      </Badge>
                      {submission.startDate && (
                        <Text size="xs" color="secondary" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(submission.startDate)}
                        </Text>
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <Music className="h-4 w-4 text-[var(--color-accent-primary)] flex-shrink-0" />
                        <Heading size="sm" className="line-clamp-2">{submission.title}</Heading>
                      </div>

                      {submission.artist && (
                        <Text size="sm" color="secondary" className="mb-3 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {submission.artist}
                        </Text>
                      )}
                    </div>

                    {submission.submissionCount !== undefined && (
                      <div className="mt-auto pt-3 border-t border-[var(--color-accent-primary)]/30">
                        <div className="flex items-center justify-between">
                          <Text size="sm" color="secondary">
                            {submission.submissionCount} {submission.submissionCount === 1 ? 'submission' : 'submissions'}
                          </Text>
                          <ExternalLink className="h-4 w-4 text-[var(--color-accent-primary)]" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </AnimatedListItem>
          ))}
        </AnimatedList>

        <Animated variant="fadeInUp" className="text-center mt-12">
          <Link href={routes.projects.rounds.list(projectSlug)} className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Text color="accent" weight="medium">
              {content.viewAllLink}
            </Text>
            <ExternalLink className="h-4 w-4 text-[var(--color-accent-primary)]" />
          </Link>
        </Animated>
      </div>
    </div>
  );
};
