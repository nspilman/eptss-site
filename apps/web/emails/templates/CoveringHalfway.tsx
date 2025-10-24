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

interface CoveringHalfwayProps {
  userName: string;
  roundName: string;
  roundSlug: string;
  songTitle: string;
  songArtist: string;
  coversDue: string;
}

export const CoveringHalfway: React.FC<CoveringHalfwayProps> = ({
  userName,
  roundName,
  roundSlug,
  songTitle,
  songArtist,
  coversDue,
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everyoneplaysthesamesong.com';
  const roundUrl = `${appUrl}/round/${roundSlug}`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="EPTSS Check-in" emoji="🎸" />
          
          <Section style={content}>
            <Text style={greeting}>Hey {userName}!</Text>
            
            <Text style={paragraph}>
              You&apos;re halfway through the covering period for {roundName}! 
            </Text>

            <Text style={paragraph}>
              How&apos;s your cover of <strong>{songTitle}</strong> by {songArtist} coming along?
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Covers due:</Text>
              <Text style={infoValue}>{coversDue}</Text>
            </Section>

            <Text style={paragraph}>
              Whether you&apos;re just getting started or putting the finishing touches on your masterpiece, 
              we&apos;re excited to hear what you create!
            </Text>

            <Section style={buttonContainer}>
              <Link href={roundUrl} style={button}>
                View Round Details
              </Link>
            </Section>

            <Hr style={divider} />

            <Text style={footer}>
              Keep making music! 🎵
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CoveringHalfway;

// Styles (reusing from VotingClosesTomorrow)
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
  backgroundColor: '#6366f1',
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
