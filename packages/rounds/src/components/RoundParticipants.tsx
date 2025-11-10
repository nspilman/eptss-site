"use client";

import { motion } from "framer-motion";
import React from "react";
import { RoundInfo } from "@eptss/data-access/types/round";
import { Card, CardContent, CardHeader, UserAvatar } from "@eptss/ui";
import { Users } from "lucide-react";
import { getDisplayName } from "@eptss/shared";

interface RoundParticipantsProps {
  roundInfo: RoundInfo;
}

export const RoundParticipants = ({ roundInfo }: RoundParticipantsProps) => {
  const { signups } = roundInfo;

  // Filter out signups without userId (unverified) and only show unique users
  const uniqueParticipants = signups
    .filter(signup => signup.userId)
    .reduce((acc, signup) => {
      if (!acc.find(p => p.userId === signup.userId)) {
        acc.push(signup);
      }
      return acc;
    }, [] as typeof signups);

  if (uniqueParticipants.length === 0) {
    return null;
  }

  // Helper function to get profile URL
  const getProfileUrl = (signup: typeof signups[0]) => {
    return `/profile/${signup.username || signup.email.split('@')[0]}`;
  };

  return (
    <Card className="w-full bg-background-primary/60 backdrop-blur-sm border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
          >
            <Users className="w-5 h-5 text-background-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary">Round Participants</h3>
            <p className="text-sm text-gray-400">{uniqueParticipants.length} {uniqueParticipants.length === 1 ? 'person' : 'people'} signed up</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {uniqueParticipants.map((participant, index) => (
            <motion.div
              key={participant.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <a
                href={getProfileUrl(participant)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <UserAvatar
                  profilePictureUrl={participant.profilePictureUrl}
                  displayName={getDisplayName(participant)}
                  size="md"
                  showHoverEffect
                />
                <div className="text-center max-w-full">
                  <p className="text-sm font-medium text-primary group-hover:text-accent-primary transition-colors truncate max-w-[100px]" title={getDisplayName(participant)}>
                    {getDisplayName(participant)}
                  </p>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
