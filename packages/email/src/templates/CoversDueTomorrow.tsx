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

interface CoversDueTomorrowProps {
  userName: string;
  roundName: string;
  roundSlug: string;
  songTitle: string;
  songArtist: string;
  coversDue: string;
  listeningParty: string;
  hasSubmitted: boolean;
}

export const CoversDueTomorrow: React.FC<CoversDueTomorrowProps> = ({
  userName,
  roundName,
  roundSlug,
  songTitle,
  songArtist,
  coversDue,
  listeningParty,
  hasSubmitted,
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everyoneplaysthesamesong.com';
  const submitUrl = `${appUrl}/submit?round=${roundSlug}`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="EPTSS Final Call" emoji="🚨" />
          
          <Section style={content}>
            <Text style={greeting}>Hey {userName}!</Text>
            
            {hasSubmitted ? (
              <>
                <Text style={paragraph}>
                  Your cover is submitted! This is your last chance to make any final updates before the deadline tomorrow.
                </Text>
                <Text style={paragraph}>
                  We&apos;ll see you at the listening party on {listeningParty}! 🎉
                </Text>
              </>
            ) : (
              <>
                <Text style={urgentText}>
                  ⏰ FINAL CALL: Covers due tomorrow!
                </Text>
                <Text style={paragraph}>
                  This is it! You have until tomorrow to submit your cover of{' '}
                  <strong>{songTitle}</strong> by {songArtist} for {roundName}.
                </Text>
                <Text style={paragraph}>
                  Remember: done is better than perfect. We want to hear what you&apos;ve created, 
                  and the listening party won&apos;t be the same without you!
                </Text>
              </>
            )}

            <Section style={urgentBox}>
              <Text style={urgentBoxLabel}>⏰ Deadline:</Text>
              <Text style={urgentBoxValue}>{coversDue}</Text>
            </Section>

            <Section style={infoBox}>
              <Text style={infoLabel}>Listening Party:</Text>
              <Text style={infoValue}>{listeningParty}</Text>
            </Section>

            {!hasSubmitted && (
              <Section style={buttonContainer}>
                <Link href={submitUrl} style={button}>
                  Submit Your Cover NOW
                </Link>
              </Section>
            )}

            <Hr style={divider} />

            <Text style={footer}>
              Don&apos;t miss out! Submit before the deadline! 🎵
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CoversDueTomorrow;

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
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#ef4444',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#e0e0e0',
  margin: '0 0 16px 0',
};

const urgentBox = {
  backgroundColor: '#7f1d1d',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
  border: '2px solid #ef4444',
  textAlign: 'center' as const,
};

const urgentBoxLabel = {
  fontSize: '14px',
  color: '#fca5a5',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
  fontWeight: 'bold',
};

const urgentBoxValue = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
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
  backgroundColor: '#ef4444',
  color: '#ffffff',
  padding: '14px 36px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
  fontSize: '16px',
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
