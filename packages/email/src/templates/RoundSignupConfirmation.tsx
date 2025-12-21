import * as React from 'react';
import {
  Body,
  Button,
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

interface RoundSignupConfirmationProps {
  userName?: string;
  roundName: string;
  songTitle: string;
  artist: string;
  youtubeLink: string;
  roundUrl: string;
  baseUrl: string;
  phaseDates: {
    votingOpens: string;
    coveringBegins: string;
    coversDue: string;
    listeningParty: string;
  };
  customGreeting?: string;
  customInstructions?: string;
  customCtaText?: string;
  customCtaUrl?: string;
}

export const RoundSignupConfirmation = ({
  userName,
  roundName,
  songTitle,
  artist,
  youtubeLink,
  roundUrl,
  baseUrl,
  phaseDates,
  customGreeting,
  customInstructions,
  customCtaText,
  customCtaUrl,
}: RoundSignupConfirmationProps) => {
  const greeting = customGreeting || (userName ? `Hi ${userName}` : 'Hi');
  const ctaButtonText = customCtaText || 'View Round Details';
  const ctaButtonUrl = customCtaUrl || roundUrl;

  return (
    <Html>
      <Head />
      <Preview>You&apos;re signed up for {roundName}! 🎵</Preview>
      <Tailwind>
        <Body className="bg-[#0a0a14] font-sans">
          <Container className="mx-auto my-8 max-w-2xl">
            {/* Header */}
            <Section className="rounded-t-lg bg-gradient-to-r from-[#40e2e2] to-[#e2e240] px-8 py-10 text-center">
              <Heading className="m-0 text-3xl font-bold text-[#0a0a14]">
                🎵 You&apos;re In!
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="rounded-b-lg border border-t-0 border-gray-700 bg-[#111827] px-8 py-8">
              <Text className="mb-5 text-base text-[#f8f9fa]">
                {greeting},
              </Text>

              <Text className="mb-5 text-base text-[#f8f9fa]">
                Your signup for <strong>{roundName}</strong> has been confirmed! 🎉
              </Text>

              {/* Song Choice Card */}
              <Section className="mb-6 rounded-lg bg-[#1f2937] border border-gray-700 p-5">
                <Heading className="mt-0 text-xl font-semibold text-[#e2e240]">
                  Your Song Choice
                </Heading>
                <Text className="my-2 text-base text-[#f8f9fa]">
                  <strong>Title:</strong> {songTitle}
                  <br />
                  <strong>Artist:</strong> {artist}
                </Text>
                <Link
                  href={youtubeLink}
                  className="mt-3 inline-block font-medium text-[#40e2e2] no-underline"
                >
                  🎬 Watch on YouTube →
                </Link>
              </Section>

              {/* What's Next */}
              <Heading className="mb-5 mt-8 text-lg font-semibold text-[#f8f9fa]">
                What&apos;s Next?
              </Heading>

              {/* Phase Timeline */}
              <Section className="mb-4 border-l-4 border-[#e2e240] pl-4">
                <Text className="mb-1 font-semibold text-[#e2e240]">
                  Voting Opens: {phaseDates.votingOpens}
                </Text>
                <Text className="mt-0 text-sm text-gray-400">
                  Vote for your favorite song to cover
                </Text>
              </Section>

              <Section className="mb-4 border-l-4 border-[#40e2e2] pl-4">
                <Text className="mb-1 font-semibold text-[#40e2e2]">
                  Covering Begins: {phaseDates.coveringBegins}
                </Text>
                <Text className="mt-0 text-sm text-gray-400">
                  Start working on your cover
                </Text>
              </Section>

              <Section className="mb-4 border-l-4 border-[#e2e240] pl-4">
                <Text className="mb-1 font-semibold text-[#e2e240]">
                  Covers Due: {phaseDates.coversDue}
                </Text>
                <Text className="mt-0 text-sm text-gray-400">
                  Submit your finished cover
                </Text>
              </Section>

              <Section className="mb-6 border-l-4 border-[#40e2e2] pl-4">
                <Text className="mb-1 font-semibold text-[#40e2e2]">
                  Listening Party: {phaseDates.listeningParty}
                </Text>
                <Text className="mt-0 text-sm text-gray-400">
                  Celebrate and listen to all covers
                </Text>
              </Section>

              {/* Custom Instructions */}
              {customInstructions && (
                <Section className="mb-6 mt-6 rounded-lg bg-[#1f2937] border border-gray-700 p-5">
                  <Text className="m-0 text-base text-[#f8f9fa] whitespace-pre-line">
                    {customInstructions}
                  </Text>
                </Section>
              )}

              {/* CTA Button */}
              <Section className="mt-8 text-center">
                <Button
                  href={ctaButtonUrl}
                  className="rounded-md bg-gradient-to-r from-[#40e2e2] to-[#e2e240] px-8 py-3 text-base font-semibold text-[#0a0a14] no-underline"
                >
                  {ctaButtonText}
                </Button>
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

export default RoundSignupConfirmation;
