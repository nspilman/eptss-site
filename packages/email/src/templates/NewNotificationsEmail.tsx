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

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  type: string;
}

interface NewNotificationsEmailProps {
  userName?: string;
  notifications: NotificationItem[];
  baseUrl: string;
  unsubscribeUrl: string;
}

export const NewNotificationsEmail = ({
  userName,
  notifications,
  baseUrl,
  unsubscribeUrl,
}: NewNotificationsEmailProps) => {
  const greeting = userName ? `Hi ${userName}` : 'Hi there';
  const notificationCount = notifications.length;
  const pluralizedNotification = notificationCount === 1 ? 'notification' : 'notifications';
  const dashboardUrl = `${baseUrl}/dashboard`;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#0a0a14] font-sans text-gray-100">
          <Container className="mx-auto my-8 max-w-2xl bg-[#1a1a2e] rounded-lg border border-gray-800">
            {/* Header with gradient */}
            <Section className="bg-gradient-to-r from-cyan-600 to-purple-600 rounded-t-lg p-8 text-center">
              <Heading className="text-4xl m-0 mb-2">🔔</Heading>
              <Heading className="text-2xl text-white m-0 font-semibold">
                New Notifications
              </Heading>
            </Section>

            {/* Content */}
            <Section className="p-8">
              <Text className="text-base text-gray-100 mb-4">
                {greeting},
              </Text>
              <Text className="text-base text-gray-300 mb-6">
                You have {notificationCount} new {pluralizedNotification} waiting for you on EPTSS:
              </Text>

              {/* Notifications list */}
              <div>
                {notifications.slice(0, 5).map((notif) => {
                  const timeAgo = formatTimeAgo(notif.createdAt);

                  return (
                    <div key={notif.id} className="mb-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <Text className="text-sm font-semibold text-cyan-400 mb-1 mt-0">
                        {notif.title}
                      </Text>
                      <Text className="text-sm text-gray-300 mb-2 mt-0">
                        {notif.message}
                      </Text>
                      <Text className="text-xs text-gray-500 m-0">
                        {timeAgo}
                      </Text>
                    </div>
                  );
                })}
              </div>

              {notificationCount > 5 && (
                <Text className="text-center text-gray-400 text-sm my-4">
                  And {notificationCount - 5} more {notificationCount - 5 === 1 ? 'notification' : 'notifications'}...
                </Text>
              )}

              {/* CTA Button */}
              <Section className="text-center my-6">
                <Button
                  href={dashboardUrl}
                  style={{
                    background: 'linear-gradient(to right, #0891b2, #9333ea)',
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
                You're receiving this email because you have notification emails enabled.
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

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  const intervals: Record<string, number> = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      return interval === 1 ? `1 ${name} ago` : `${interval} ${name}s ago`;
    }
  }

  return 'just now';
}

export default NewNotificationsEmail;
