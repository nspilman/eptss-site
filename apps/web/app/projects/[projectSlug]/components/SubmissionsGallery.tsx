"use client";

import { Card, CardContent, Badge, SectionHeader, Animated, AnimatedList, AnimatedListItem } from "@eptss/ui";
import { Music, Calendar, User, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
}

export const SubmissionsGallery = ({ submissions }: SubmissionsGalleryProps) => {
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
          title="Past Submissions"
          subtitle="Our creative journey is just beginning"
        />
        <Card className="max-w-md mx-auto mt-8 bg-[var(--color-background-tertiary)] border-purple-700/50">
          <CardContent className="text-center py-12">
            <Music className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <p className="text-gray-300 text-lg">
              Be the first to create an original song this month!
            </p>
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
          title="Past Original Songs"
          subtitle="Discover the creativity of our songwriting community"
        />

        <AnimatedList variant="fadeInUp" staggerDelay={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {submissions.map((submission, index) => (
            <AnimatedListItem key={submission.roundId}>
              <Link href={`/round/${submission.slug}`}>
                <Card
                  className="h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/50 hover:border-purple-500 transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-purple-600/50 text-purple-200 border-purple-500">
                        Round {submission.roundId}
                      </Badge>
                      {submission.startDate && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(submission.startDate)}
                        </span>
                      )}
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Music className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span className="line-clamp-2">{submission.title}</span>
                      </h3>

                      {submission.artist && (
                        <p className="text-gray-400 text-sm mb-3 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {submission.artist}
                        </p>
                      )}
                    </div>

                    {submission.submissionCount !== undefined && (
                      <div className="mt-auto pt-3 border-t border-purple-700/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            {submission.submissionCount} {submission.submissionCount === 1 ? 'submission' : 'submissions'}
                          </span>
                          <ExternalLink className="h-4 w-4 text-purple-400" />
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
          <Link
            href="/rounds"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            View All Past Rounds
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Animated>
      </div>
    </div>
  );
};
