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

interface AdminSubmissionNotificationProps {
  userEmail: string;
  userName?: string;
  roundName: string;
  roundSlug: string;
  soundcloudUrl: string;
  additionalComments?: {
    coolThingsLearned?: string;
    toolsUsed?: string;
    happyAccidents?: string;
    didntWork?: string;
  };
  roundUrl: string;
  baseUrl: string;
}

export const AdminSubmissionNotification = ({
  userEmail,
  userName,
  roundName,
  roundSlug,
  soundcloudUrl,
  additionalComments,
  roundUrl,
  baseUrl,
}: AdminSubmissionNotificationProps) => {
  const displayName = userName || userEmail;

  return (
    <Html>
      <Head />
      <Preview>New submission: {userEmail}</Preview>
      <Tailwind>
        <Body className="bg-[#0a0a14] font-sans">
          <Container className="mx-auto my-8 max-w-2xl">
            {/* Header */}
            <Section className="rounded-t-lg bg-gradient-to-r from-[#40e2e2] to-[#e2e240] px-8 py-6 text-center">
              <Heading className="m-0 text-2xl font-bold text-[#0a0a14]">
                🎸 New Submission
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="rounded-b-lg border border-t-0 border-gray-700 bg-[#111827] px-8 py-8">
              <Text className="mb-5 text-base text-[#f8f9fa]">
                <strong>{displayName}</strong> ({userEmail}) just submitted their cover for <strong>{roundName}</strong>!
              </Text>

              {/* Submission Details */}
              <Section className="mb-6 rounded-lg bg-[#1f2937] border border-gray-700 p-5">
                <Heading className="mt-0 text-lg font-semibold text-[#e2e240]">
                  Submission
                </Heading>
                <Link
                  href={soundcloudUrl}
                  className="mt-2 inline-block font-medium text-[#40e2e2] no-underline"
                >
                  🎵 Listen on SoundCloud →
                </Link>
              </Section>

              {/* Additional Comments */}
              {additionalComments && (
                <Section className="mb-6 rounded-lg bg-[#1f2937] border border-gray-700 p-5">
                  <Heading className="mt-0 text-lg font-semibold text-[#e2e240]">
                    Notes from Artist
                  </Heading>
                  
                  {additionalComments.coolThingsLearned && (
                    <Section className="mb-3">
                      <Text className="mb-1 text-sm font-semibold text-[#40e2e2]">
                        Cool Things Learned:
                      </Text>
                      <Text className="mt-0 text-sm text-[#f8f9fa]">
                        {additionalComments.coolThingsLearned}
                      </Text>
                    </Section>
                  )}

                  {additionalComments.toolsUsed && (
                    <Section className="mb-3">
                      <Text className="mb-1 text-sm font-semibold text-[#40e2e2]">
                        Tools Used:
                      </Text>
                      <Text className="mt-0 text-sm text-[#f8f9fa]">
                        {additionalComments.toolsUsed}
                      </Text>
                    </Section>
                  )}

                  {additionalComments.happyAccidents && (
                    <Section className="mb-3">
                      <Text className="mb-1 text-sm font-semibold text-[#40e2e2]">
                        Happy Accidents:
                      </Text>
                      <Text className="mt-0 text-sm text-[#f8f9fa]">
                        {additionalComments.happyAccidents}
                      </Text>
                    </Section>
                  )}

                  {additionalComments.didntWork && (
                    <Section className="mb-0">
                      <Text className="mb-1 text-sm font-semibold text-[#40e2e2]">
                        What Didn&apos;t Work:
                      </Text>
                      <Text className="mt-0 text-sm text-[#f8f9fa]">
                        {additionalComments.didntWork}
                      </Text>
                    </Section>
                  )}
                </Section>
              )}

              {/* Quick Links */}
              <Section className="mt-6">
                <Text className="text-sm text-gray-400 mb-2">Quick Actions:</Text>
                <Text className="text-sm mb-1">
                  <Link
                    href={roundUrl}
                    className="text-[#40e2e2] no-underline"
                  >
                    View All Submissions →
                  </Link>
                </Text>
                <Text className="text-sm">
                  <Link
                    href={`${baseUrl}/admin?slug=${roundSlug}`}
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

export default AdminSubmissionNotification;
