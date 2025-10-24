"use client";

import { RoundCard, Button, Badge } from "@eptss/ui";
import { motion } from "framer-motion";
import { Disc, Mic2, Users, Music, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface Props {
  rounds: {
    title: string;
    artist: string;
    roundId: number;
    slug: string;
    playlistUrl: string;
    signupCount?: number;
    submissionCount?: number;
    startDate?: string;
    endDate?: string;
  }[];
  currentRoundId: number | null;
  isVotingPhase: boolean;
}

export const ClientRoundsDisplay = ({ rounds, currentRoundId, isVotingPhase }: Props) => {
  const [showAllRounds, setShowAllRounds] = useState(false);
  const displayedRounds = showAllRounds 
    ? rounds 
    : rounds.filter(round => currentRoundId ? round.roundId > currentRoundId - 4 : true);

  // Format date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  return (
    <div className="py-16 bg-[var(--color-background-secondary)] rounded-xl">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[var(--color-white)]">
            Our Creative Journey
          </h2>
          <p className="text-xl text-[var(--color-gray-300)] max-w-2xl mx-auto">
            Explore our past and current rounds
          </p>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="grid gap-6">
            {displayedRounds.map((round, index) => {
              const isCurrent = round.roundId === currentRoundId;
              
              return (
                <motion.div
                  key={round.roundId}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`round/${round.slug}`}>
                    <div className={`p-6 rounded-lg border ${isCurrent ? 'bg-[var(--color-gray-800)] opacity-60 border-[var(--color-accent-primary)]' : 'bg-[var(--color-background-tertiary)] border-[var(--color-gray-800)] hover:border-[var(--color-gray-700)]'} transition-all duration-200`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          {isCurrent && (
                            <Badge className="mb-2 bg-[var(--color-accent-primary)] text-[var(--color-gray-900)]">
                              Current Round
                            </Badge>
                          )}
                          
                          <h3 className="text-xl md:text-2xl font-bold text-[var(--color-white)] mb-1 flex items-center gap-2">
                            <Music className="h-5 w-5 text-[var(--color-accent-primary)]" />
                            {isCurrent && isVotingPhase 
                              ? "Song selection underway" 
                              : <>{round.title} <span className="text-[var(--color-gray-400)]">by</span> {round.artist}</>}
                          </h3>
                          
                          <div className="text-[var(--color-gray-400)] flex items-center gap-2 mb-3">
                            <span className="flex items-center gap-1">
                              <Disc className="h-4 w-4" />
                              Round {round.roundId}
                            </span>
                            {round.startDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(round.startDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          {round.signupCount !== undefined && (
                            <div className="flex flex-col items-center px-3 py-2 bg-[var(--color-gray-800)] opacity-50 rounded">
                              <div className="flex items-center gap-1 text-[var(--color-gray-300)] text-sm">
                                <Users className="h-4 w-4 text-[var(--color-accent-primary)]" />
                                Participants
                              </div>
                              <span className="text-xl font-bold text-[var(--color-white)]">{round.signupCount}</span>
                            </div>
                          )}
                          
                          {round.submissionCount !== undefined && !isCurrent && (
                            <div className="flex flex-col items-center px-3 py-2 bg-[var(--color-gray-800)] opacity-50 rounded">
                              <div className="flex items-center gap-1 text-[var(--color-gray-300)] text-sm">
                                <Mic2 className="h-4 w-4 text-[var(--color-accent-primary)]" />
                                Submissions
                              </div>
                              <span className="text-xl font-bold text-[var(--color-white)]">{round.submissionCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          {rounds.length > 4 && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                className="border-[var(--color-gray-700)] text-[var(--color-gray-300)] hover:bg-[var(--color-gray-800)]"
                onClick={() => setShowAllRounds(!showAllRounds)}
              >
                {showAllRounds ? (
                  <>
                    Show Recent Rounds
                    <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    View All Rounds
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
