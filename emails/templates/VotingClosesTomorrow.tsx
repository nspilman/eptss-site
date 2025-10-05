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

interface VotingClosesTomorrowProps {
  userName: string;
  roundName: string;
  roundSlug: string;
  votingCloses: string;
}

export const VotingClosesTomorrow: React.FC<VotingClosesTomorrowProps> = ({
  userName,
  roundName,
  roundSlug,
  votingCloses,
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everyoneplaysthesamesong.com';
  const votingUrl = `${appUrl}/voting?round=${roundSlug}`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="EPTSS Reminder" emoji="⏰" />
          
          <Section style={content}>
            <Text style={greeting}>Hey {userName}!</Text>
            
            <Text style={paragraph}>
              Just a friendly reminder that <strong>voting closes tomorrow</strong> for {roundName}!
            </Text>

            <Text style={paragraph}>
              If you haven&apos;t voted yet, now&apos;s your chance to help choose which song we&apos;ll all be covering this round.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Voting closes:</Text>
              <Text style={infoValue}>{votingCloses}</Text>
            </Section>

            <Section style={buttonContainer}>
              <Link href={votingUrl} style={button}>
                Vote Now
              </Link>
            </Section>

            <Hr style={divider} />

            <Text style={footer}>
              Don&apos;t want these reminders? You can manage your email preferences in your account settings.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VotingClosesTomorrow;

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
