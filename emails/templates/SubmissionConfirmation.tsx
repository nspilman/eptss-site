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

interface SubmissionConfirmationProps {
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
  listeningPartyDate: string;
}

export const SubmissionConfirmation = ({
  userEmail,
  userName,
  roundName,
  roundSlug,
  soundcloudUrl,
  additionalComments,
  roundUrl,
  baseUrl,
  listeningPartyDate,
}: SubmissionConfirmationProps) => {
  const greeting = userName ? `Hi ${userName}` : 'Hi';

  return (
    <Html>
      <Head />
      <Preview>Your cover for {roundName} has been submitted! 🎸</Preview>
      <Tailwind>
        <Body className="bg-[#0a0a14] font-sans">
          <Container className="mx-auto my-8 max-w-2xl">
            {/* Header */}
            <Section className="rounded-t-lg bg-gradient-to-r from-[#40e2e2] to-[#e2e240] px-8 py-10 text-center">
              <Heading className="m-0 text-3xl font-bold text-[#0a0a14]">
                🎸 Cover Submitted!
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="rounded-b-lg border border-t-0 border-gray-700 bg-[#111827] px-8 py-8">
              <Text className="mb-5 text-base text-[#f8f9fa]">
                {greeting},
              </Text>

              <Text className="mb-5 text-base text-[#f8f9fa]">
                Your cover for <strong>{roundName}</strong> has been successfully submitted! 🎉
              </Text>

              {/* Submission Details */}
              <Section className="mb-6 rounded-lg bg-[#1f2937] border border-gray-700 p-5">
                <Heading className="mt-0 text-xl font-semibold text-[#e2e240]">
                  Your Submission
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
                    Your Notes
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

              {/* What's Next */}
              <Heading className="mb-5 mt-8 text-lg font-semibold text-[#f8f9fa]">
                What&apos;s Next?
              </Heading>

              <Section className="mb-6 border-l-4 border-[#e2e240] pl-4">
                <Text className="mb-1 font-semibold text-[#e2e240]">
                  Listening Party: {listeningPartyDate}
                </Text>
                <Text className="mt-0 text-sm text-gray-400">
                  Join us to celebrate and listen to all the covers together! We&apos;ll share the playlist with everyone&apos;s submissions.
                </Text>
              </Section>

              {/* CTA Button */}
              <Section className="mt-8 text-center">
                <Link
                  href={roundUrl}
                  className="inline-block rounded-md bg-gradient-to-r from-[#40e2e2] to-[#e2e240] px-8 py-3 text-base font-semibold text-[#0a0a14] no-underline"
                >
                  View All Submissions
                </Link>
              </Section>

              {/* Footer */}
              <Section className="mt-8 border-t border-gray-700 pt-5">
                <Text className="text-sm text-gray-400">
                  Amazing work! We can&apos;t wait to hear your cover at the listening party. 🎧
                </Text>
                <Text className="mt-3 text-sm text-gray-400">
                  Questions? Reply to this email or visit our{' '}
                  <Link href={baseUrl} className="text-[#40e2e2] no-underline">
                    website
                  </Link>
                  .
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

export default SubmissionConfirmation;
