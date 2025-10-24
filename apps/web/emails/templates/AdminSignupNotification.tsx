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

interface AdminSignupNotificationProps {
  userEmail: string;
  userName?: string;
  songTitle: string;
  artist: string;
  youtubeLink: string;
  roundName: string;
  roundUrl: string;
  baseUrl: string;
}

export const AdminSignupNotification = ({
  userEmail,
  userName,
  songTitle,
  artist,
  youtubeLink,
  roundName,
  roundUrl,
  baseUrl,
}: AdminSignupNotificationProps) => {
  const displayName = userName || userEmail;

  return (
    <Html>
      <Head />
      <Preview>New signup: {userEmail} - {songTitle}</Preview>
      <Tailwind>
        <Body className="bg-[#0a0a14] font-sans">
          <Container className="mx-auto my-8 max-w-2xl">
            {/* Header */}
            <Section className="rounded-t-lg bg-gradient-to-r from-[#40e2e2] to-[#e2e240] px-8 py-6 text-center">
              <Heading className="m-0 text-2xl font-bold text-[#0a0a14]">
                🎵 New Signup
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="rounded-b-lg border border-t-0 border-gray-700 bg-[#111827] px-8 py-8">
              <Text className="mb-5 text-base text-[#f8f9fa]">
                <strong>{displayName}</strong> ({userEmail}) just signed up for <strong>{roundName}</strong>!
              </Text>

              {/* Song Details */}
              <Section className="mb-6 rounded-lg bg-[#1f2937] border border-gray-700 p-5">
                <Heading className="mt-0 text-lg font-semibold text-[#e2e240]">
                  Song Choice
                </Heading>
                <Text className="my-2 text-base text-[#f8f9fa]">
                  <strong>{songTitle}</strong> by {artist}
                </Text>
                <Link
                  href={youtubeLink}
                  className="mt-2 inline-block font-medium text-[#40e2e2] no-underline"
                >
                  🎬 Watch on YouTube →
                </Link>
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
                    href={`${baseUrl}/admin?slug=${roundName}`}
                    className="text-[#40e2e2] no-underline"
                  >
                    Admin Dashboard →
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

export default AdminSignupNotification;
