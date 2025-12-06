"use client";

import { motion } from "framer-motion";
import React from "react";
import { RoundInfo } from "@eptss/data-access/types/round";
import { Card, CardContent, CardHeader, UserAvatar } from "@eptss/ui";
import { Users } from "lucide-react";
import { getDisplayName } from "@eptss/shared";

interface RoundParticipantsProps {
  roundInfo: RoundInfo;
  currentUserId?: string;
}

export const RoundParticipants = ({ roundInfo, currentUserId }: RoundParticipantsProps) => {
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

  // Sort participants with hierarchy:
  // 1. Current user
  // 2. Users with both profile photo and publicDisplayName
  // 3. Users who have updated their publicDisplayName (without photo)
  // 4. Everyone else
  const sortedParticipants = currentUserId
    ? [
        // 1. Current user first
        ...uniqueParticipants.filter(p => p.userId === currentUserId),
        // 2. Users with both profile photo and publicDisplayName (not current user)
        ...uniqueParticipants.filter(p =>
          p.userId !== currentUserId &&
          p.profilePictureUrl &&
          p.profilePictureUrl.trim?.() !== '' &&
          p.publicDisplayName &&
          p.publicDisplayName.trim?.() !== ''
        ),
        // 3. Users with publicDisplayName but no photo (not current user)
        ...uniqueParticipants.filter(p =>
          p.userId !== currentUserId &&
          (!p.profilePictureUrl || p.profilePictureUrl.trim?.() === '') &&
          p.publicDisplayName &&
          p.publicDisplayName.trim?.() !== ''
        ),
        // 4. Everyone else (no publicDisplayName or empty publicDisplayName)
        ...uniqueParticipants.filter(p =>
          p.userId !== currentUserId &&
          (!p.publicDisplayName || p.publicDisplayName.trim?.() === '')
        )
      ]
    : [
        // When no current user, just use the hierarchy without step 1
        // 1. Users with both profile photo and publicDisplayName
        ...uniqueParticipants.filter(p =>
          p.profilePictureUrl &&
          p.profilePictureUrl.trim?.() !== '' &&
          p.publicDisplayName &&
          p.publicDisplayName.trim?.() !== ''
        ),
        // 2. Users with publicDisplayName but no photo
        ...uniqueParticipants.filter(p =>
          (!p.profilePictureUrl || p.profilePictureUrl.trim?.() === '') &&
          p.publicDisplayName &&
          p.publicDisplayName.trim?.() !== ''
        ),
        // 3. Everyone else (no publicDisplayName or empty publicDisplayName)
        ...uniqueParticipants.filter(p => !p.publicDisplayName || p.publicDisplayName.trim?.() === '')
      ];

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
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
          >
            <Users className="w-5 h-5 text-background-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-primary">Round Participants</h3>
            <p className="text-sm text-gray-400">{uniqueParticipants.length} {uniqueParticipants.length === 1 ? 'person' : 'people'} signed up</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {sortedParticipants.map((participant, index) => (
            <motion.div
              key={participant.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="min-w-0"
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
                <div className="text-center w-full min-w-0">
                  <p className="text-sm font-medium text-primary group-hover:text-accent-primary transition-colors truncate px-1" title={getDisplayName(participant)}>
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
