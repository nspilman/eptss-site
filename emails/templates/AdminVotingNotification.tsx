import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';

interface VotedSong {
  title: string;
  artist: string;
  rating: number;
}

interface AdminVotingNotificationProps {
  userEmail: string;
  userName?: string;
  roundName: string;
  roundSlug: string;
  votedSongs: VotedSong[];
  roundUrl: string;
  baseUrl: string;
}

export const AdminVotingNotification = ({
  userEmail,
  userName,
  roundName,
  roundSlug,
  votedSongs,
  roundUrl,
  baseUrl,
}: AdminVotingNotificationProps) => {
  const displayName = userName || userEmail;

  return (
    <Html>
      <Head />
      <Preview>New votes: {userEmail} - {String(votedSongs.length)} songs</Preview>
      <Tailwind>
        <Body className="bg-[#0a0a14] font-sans">
          <Container className="mx-auto my-8 max-w-2xl">
            {/* Header */}
            <Section className="rounded-t-lg bg-gradient-to-r from-[#40e2e2] to-[#e2e240] px-8 py-6 text-center">
              <Heading className="m-0 text-2xl font-bold text-[#0a0a14]">
                🗳️ New Votes
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="rounded-b-lg border border-t-0 border-gray-700 bg-[#111827] px-8 py-8">
              <Text className="mb-5 text-base text-[#f8f9fa]">
                <strong>{displayName}</strong> ({userEmail}) just voted for <strong>{roundName}</strong>! They voted on {votedSongs.length} {votedSongs.length === 1 ? 'song' : 'songs'}.
              </Text>

              {/* Vote Details */}
              <Section className="mb-6 rounded-lg bg-[#1f2937] border border-gray-700 p-5">
                <Heading className="mt-0 text-lg font-semibold text-[#e2e240]">
                  Votes Cast ({votedSongs.length} songs)
                </Heading>
                {votedSongs.map((song, index) => (
                  <Section key={index} className={`mb-3 pb-3 ${index < votedSongs.length - 1 ? 'border-b border-gray-700' : ''}`}>
                    <Text className="my-1 text-base text-[#f8f9fa]">
                      <strong>{song.title}</strong> by {song.artist}
                    </Text>
                    <Text className="mt-1 mb-0 text-sm text-[#40e2e2]">
                      Rating: {'⭐'.repeat(song.rating)} ({song.rating}/5)
                    </Text>
                  </Section>
                ))}
              </Section>

              {/* Quick Links */}
              <Section className="mt-6">
                <Text className="text-sm text-gray-400 mb-2">Quick Actions:</Text>
                <Text className="text-sm mb-1">
                  <Link
                    href={roundUrl}
                    className="text-[#40e2e2] no-underline"
                  >
                    View Round Details →
                  </Link>
                </Text>
                <Text className="text-sm">
                  <Link
                    href={`${baseUrl}/admin?slug=${roundSlug}&tab=reports`}
                    className="text-[#40e2e2] no-underline"
                  >
                    View Voting Results →
                  </Link>
                </Text>
              </Section>
            </Section>

            {/* Footer Text */}
            <Text className="mt-5 text-center text-xs text-gray-500">
              EPTSS - Everyone Plays the Same Song
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AdminVotingNotification;
