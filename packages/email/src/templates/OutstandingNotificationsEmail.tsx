import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Text,
  Tailwind,
  Button,
} from '@react-email/components';

interface OutstandingNotificationsEmailProps {
  userName?: string;
  notificationCount: number;
  oldestNotificationDate: Date;
  baseUrl: string;
  unsubscribeUrl: string;
}

export const OutstandingNotificationsEmail = ({
  userName,
  notificationCount,
  oldestNotificationDate,
  baseUrl,
  unsubscribeUrl,
}: OutstandingNotificationsEmailProps) => {
  const greeting = userName ? `Hi ${userName}` : 'Hi there';
  const pluralizedNotification = notificationCount === 1 ? 'notification' : 'notifications';
  const daysSinceOldest = Math.floor(
    (new Date().getTime() - oldestNotificationDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dashboardUrl = `${baseUrl}/dashboard`;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#0a0a14] font-sans text-gray-100">
          <Container className="mx-auto my-8 max-w-2xl bg-[#1a1a2e] rounded-lg border border-gray-800">
            {/* Header with gradient */}
            <Section className="bg-gradient-to-r from-pink-600 to-orange-600 rounded-t-lg p-8 text-center">
              <Heading className="text-4xl m-0 mb-2">⏰</Heading>
              <Heading className="text-2xl text-white m-0 font-semibold">
                Unread Notifications Reminder
              </Heading>
            </Section>

            {/* Content */}
            <Section className="p-8">
              <Text className="text-base text-gray-100 mb-4">
                {greeting},
              </Text>
              <Text className="text-base text-gray-300 mb-4">
                This is a friendly reminder that you have {notificationCount} unread {pluralizedNotification} on EPTSS.
              </Text>
              <Text className="text-base text-gray-300 mb-6">
                Your oldest unread notification is from {daysSinceOldest} {daysSinceOldest === 1 ? 'day' : 'days'} ago.
              </Text>

              {/* Info box */}
              <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-md mb-6">
                <Text className="text-sm text-yellow-200 m-0">
                  💡 <strong>Don't miss out!</strong> These notifications might contain important updates about your submissions, votes, or community interactions.
                </Text>
              </div>

              {/* CTA Button */}
              <Section className="text-center my-6">
                <Button
                  href={dashboardUrl}
                  style={{
                    background: 'linear-gradient(to right, #db2777, #ea580c)',
                    color: '#ffffff',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Go To Dashboard
                </Button>
              </Section>

              <Text className="text-center text-gray-500 text-sm mt-6">
                You're receiving this reminder because you have unread notifications from {daysSinceOldest}+ days ago.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-900/50 rounded-b-lg p-6 text-center border-t border-gray-800">
              <Text className="text-gray-400 text-sm mb-2">
                <Link href={unsubscribeUrl} className="text-cyan-400 no-underline hover:underline">
                  Unsubscribe from notification emails
                </Link>
              </Text>
              <Text className="text-gray-600 text-xs m-0">
                © {new Date().getFullYear()} Every Person Their Song Sung. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OutstandingNotificationsEmail;
