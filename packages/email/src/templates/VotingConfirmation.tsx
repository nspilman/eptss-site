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

interface VotingConfirmationProps {
  userEmail: string;
  userName?: string;
  roundName: string;
  roundSlug: string;
  votedSongs: VotedSong[];
  roundUrl: string;
  baseUrl: string;
  phaseDates: {
    coveringBegins: string;
    coversDue: string;
    listeningParty: string;
  };
}

export const VotingConfirmation = ({
  userEmail,
  userName,
  roundName,
  roundSlug,
  votedSongs,
  roundUrl,
  baseUrl,
  phaseDates,
}: VotingConfirmationProps) => {
  const greeting = userName ? `Hi ${userName}` : 'Hi';

  return (
    <Html>
      <Head />
      <Preview>Your votes for {roundName} have been recorded! 🗳️</Preview>
      <Tailwind>
        <Body className="bg-[#0a0a14] font-sans">
          <Container className="mx-auto my-8 max-w-2xl">
            {/* Header */}
            <Section className="rounded-t-lg bg-gradient-to-r from-[#40e2e2] to-[#e2e240] px-8 py-10 text-center">
              <Heading className="m-0 text-3xl font-bold text-[#0a0a14]">
                🗳️ Votes Recorded!
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="rounded-b-lg border border-t-0 border-gray-700 bg-[#111827] px-8 py-8">
              <Text className="mb-5 text-base text-[#f8f9fa]">
                {greeting},
              </Text>

              <Text className="mb-5 text-base text-[#f8f9fa]">
                Your votes for <strong>{roundName}</strong> have been successfully recorded! 🎉
              </Text>

              {/* Voted Songs */}
              <Section className="mb-6 rounded-lg bg-[#1f2937] border border-gray-700 p-5">
                <Heading className="mt-0 text-xl font-semibold text-[#e2e240]">
                  Your Votes
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

              {/* What's Next */}
              <Heading className="mb-5 mt-8 text-lg font-semibold text-[#f8f9fa]">
                What&apos;s Next?
              </Heading>

              <Section className="mb-4 border-l-4 border-[#e2e240] pl-4">
                <Text className="mb-1 font-semibold text-[#e2e240]">
                  Covering Begins: {phaseDates.coveringBegins}
                </Text>
                <Text className="mt-0 text-sm text-gray-400">
                  The winning song will be announced and covering begins
                </Text>
              </Section>

              <Section className="mb-4 border-l-4 border-[#40e2e2] pl-4">
                <Text className="mb-1 font-semibold text-[#40e2e2]">
                  Covers Due: {phaseDates.coversDue}
                </Text>
                <Text className="mt-0 text-sm text-gray-400">
                  Submit your finished cover
                </Text>
              </Section>

              <Section className="mb-6 border-l-4 border-[#e2e240] pl-4">
                <Text className="mb-1 font-semibold text-[#e2e240]">
                  Listening Party: {phaseDates.listeningParty}
                </Text>
                <Text className="mt-0 text-sm text-gray-400">
                  Celebrate and listen to all covers together
                </Text>
              </Section>

              {/* CTA Button */}
              <Section className="mt-8 text-center">
                <Link
                  href={roundUrl}
                  className="inline-block rounded-md bg-gradient-to-r from-[#40e2e2] to-[#e2e240] px-8 py-3 text-base font-semibold text-[#0a0a14] no-underline"
                >
                  View Round Details
                </Link>
              </Section>

              {/* Footer */}
              <Section className="mt-8 border-t border-gray-700 pt-5">
                <Text className="text-sm text-gray-400">
                  Questions? Reply to this email or visit our{' '}
                  <Link href={baseUrl} className="text-[#40e2e2] no-underline">
                    website
                  </Link>
                  .
                </Text>
                <Text className="mt-3 text-sm text-gray-400">
                  Happy covering! 🎸
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

export default VotingConfirmation;
