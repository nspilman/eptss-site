import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';
import { EmailHeader } from '../components/EmailHeader';

/**
 * Urgency level for the reminder email
 * - normal: Regular check-in (blue theme)
 * - moderate: Halfway point (default theme)
 * - urgent: Last week or final reminder (orange/amber theme)
 */
export type ReminderUrgency = 'normal' | 'moderate' | 'urgent';

interface PhaseReminderProps {
  userName: string;
  roundName: string;
  roundSlug: string;

  // Phase information
  phaseName: string; // e.g., "Covering Phase" or "Recording Phase"
  phaseShortName: string; // e.g., "Cover" or "Record"

  // Song information (optional - some phases may not have a selected song)
  songTitle?: string;
  songArtist?: string;

  // Timing information
  timeRemaining: string; // e.g., "one month", "one week", "3 days"
  dueDate: string; // Formatted date string

  // Submission status
  hasSubmitted: boolean;

  // Urgency and styling
  urgency?: ReminderUrgency;
  emoji?: string;

  // Call to action
  ctaUrl: string;
  ctaText: string;
}

export const PhaseReminder: React.FC<PhaseReminderProps> = ({
  userName,
  roundName,
  roundSlug,
  phaseName,
  phaseShortName,
  songTitle,
  songArtist,
  timeRemaining,
  dueDate,
  hasSubmitted,
  urgency = 'normal',
  emoji = '📅',
  ctaUrl,
  ctaText,
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everyoneplaysthesamesong.com';
  const fullCtaUrl = ctaUrl.startsWith('http') ? ctaUrl : `${appUrl}${ctaUrl}`;

  // Determine styling based on urgency
  const isUrgent = urgency === 'urgent';
  const buttonColor = isUrgent ? '#f59e0b' : '#6366f1';
  const infoBoxBorder = isUrgent ? '2px solid #f59e0b' : undefined;

  // Build the song reference string
  const songReference = songTitle && songArtist
    ? `${songTitle} by ${songArtist}`
    : null;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="EPTSS Reminder" emoji={emoji} />

          <Section style={content}>
            <Text style={greeting}>Hey {userName}!</Text>

            {hasSubmitted ? (
              <>
                <Text style={paragraph}>
                  Thanks for submitting your {phaseShortName.toLowerCase()}{songReference ? ` of ${songReference}` : ''}!
                  We can't wait to hear it.
                </Text>
                <Text style={paragraph}>
                  There's still {timeRemaining} until the deadline if you want to make any updates or refinements.
                </Text>
              </>
            ) : (
              <>
                {isUrgent && (
                  <Text style={urgentText}>
                    This is it—the final {timeRemaining} to submit!
                  </Text>
                )}
                <Text style={paragraph}>
                  {isUrgent ? "You've got about " : "Just a heads up: there's about "}
                  <strong>{timeRemaining} left</strong> to submit your {phaseShortName.toLowerCase()}
                  {songReference ? ` of ${songReference}` : ''} for {roundName}.
                </Text>
                <Text style={paragraph}>
                  {isUrgent
                    ? "Don't let perfect be the enemy of done. We want to hear what you've created, even if it's not quite where you imagined it would be!"
                    : urgency === 'moderate'
                    ? "Whether you're just getting started or putting the finishing touches on your masterpiece, we're excited to hear what you create!"
                    : "Whether you're still working on it or haven't started yet, you've got this! There's plenty of time to create something awesome."
                  }
                </Text>
              </>
            )}

            <Section style={{ ...infoBox, border: infoBoxBorder }}>
              <Text style={infoLabel}>{phaseName} deadline:</Text>
              <Text style={infoValue}>{dueDate}</Text>
            </Section>

            {!hasSubmitted && (
              <Section style={buttonContainer}>
                <Link href={fullCtaUrl} style={{ ...button, backgroundColor: buttonColor }}>
                  {ctaText}
                </Link>
              </Section>
            )}

            <Hr style={divider} />

            <Text style={footer}>
              {isUrgent ? "You've got this! 💪" : "Keep making music! 🎵"}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PhaseReminder;

// Styles
const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const content = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '32px',
  border: '1px solid #2a2a2a',
};

const greeting = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 16px 0',
};

const urgentText = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#f59e0b',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#e0e0e0',
  margin: '0 0 16px 0',
};

const infoBox = {
  backgroundColor: '#252525',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
};

const infoLabel = {
  fontSize: '12px',
  color: '#999999',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
};

const infoValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
};

const divider = {
  borderColor: '#2a2a2a',
  margin: '24px 0',
};

const footer = {
  fontSize: '12px',
  color: '#666666',
  margin: '0',
  textAlign: 'center' as const,
};
