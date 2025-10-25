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

interface CoveringLastWeekProps {
  userName: string;
  roundName: string;
  roundSlug: string;
  songTitle: string;
  songArtist: string;
  coversDue: string;
  hasSubmitted: boolean;
}

export const CoveringLastWeek: React.FC<CoveringLastWeekProps> = ({
  userName,
  roundName,
  roundSlug,
  songTitle,
  songArtist,
  coversDue,
  hasSubmitted,
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everyoneplaysthesamesong.com';
  const submitUrl = `${appUrl}/submit?round=${roundSlug}`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="EPTSS Reminder" emoji="⏰" />
          
          <Section style={content}>
            <Text style={greeting}>Hey {userName}!</Text>
            
            {hasSubmitted ? (
              <>
                <Text style={paragraph}>
                  Your cover is submitted! Just one week until the deadline if you want to make any final tweaks.
                </Text>
              </>
            ) : (
              <>
                <Text style={urgentText}>
                  This is it—the final week to submit your cover!
                </Text>
                <Text style={paragraph}>
                  You&apos;ve got about <strong>7 days left</strong> to submit your cover of{' '}
                  <strong>{songTitle}</strong> by {songArtist} for {roundName}.
                </Text>
                <Text style={paragraph}>
                  Don&apos;t let perfect be the enemy of done. We want to hear what you&apos;ve created, 
                  even if it&apos;s not quite where you imagined it would be!
                </Text>
              </>
            )}

            <Section style={infoBox}>
              <Text style={infoLabel}>Covers due:</Text>
              <Text style={infoValue}>{coversDue}</Text>
            </Section>

            {!hasSubmitted && (
              <Section style={buttonContainer}>
                <Link href={submitUrl} style={button}>
                  Submit Your Cover Now
                </Link>
              </Section>
            )}

            <Hr style={divider} />

            <Text style={footer}>
              You&apos;ve got this! 💪
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CoveringLastWeek;

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
  border: '2px solid #f59e0b',
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
  backgroundColor: '#f59e0b',
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
