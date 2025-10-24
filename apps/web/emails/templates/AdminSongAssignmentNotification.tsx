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

interface AdminSongAssignmentNotificationProps {
  roundName: string;
  roundSlug: string;
  assignedSong: {
    title: string;
    artist: string;
    average: number;
    votesCount: number;
    oneStarCount: number;
  };
  allResults: Array<{
    title: string;
    artist: string;
    average: number;
    votesCount: number;
    oneStarCount: number;
  }>;
}

export const AdminSongAssignmentNotification: React.FC<AdminSongAssignmentNotificationProps> = ({
  roundName,
  roundSlug,
  assignedSong,
  allResults,
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everyoneplaysthesamesong.com';
  const roundUrl = `${appUrl}/round/${roundSlug}`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="EPTSS Admin Notification" emoji="🎵" />
          
          <Section style={content}>
            <Text style={heading}>🎵 Round Song Auto-Assigned</Text>
            
            <Text style={paragraph}>
              The winning song has been automatically assigned to <strong>{roundName}</strong>.
            </Text>

            <Section style={winnerBox}>
              <Text style={winnerLabel}>Winning Song:</Text>
              <Text style={winnerSong}>
                {assignedSong.title} - {assignedSong.artist}
              </Text>
              <Text style={stats}>
                Average: {assignedSong.average.toFixed(2)} ⭐ | 
                Votes: {assignedSong.votesCount} | 
                1-star votes: {assignedSong.oneStarCount}
              </Text>
            </Section>

            {allResults.length > 1 && (
              <>
                <Text style={subheading}>All Vote Results:</Text>
                <Section style={resultsBox}>
                  {allResults.map((result, index) => (
                    <Text key={index} style={resultItem}>
                      {index + 1}. <strong>{result.title}</strong> - {result.artist}
                      <br />
                      <span style={resultStats}>
                        Avg: {result.average.toFixed(2)} | Votes: {result.votesCount} | 1⭐: {result.oneStarCount}
                      </span>
                    </Text>
                  ))}
                </Section>
              </>
            )}

            <Section style={buttonContainer}>
              <Link href={roundUrl} style={button}>
                View Round
              </Link>
            </Section>

            <Hr style={divider} />

            <Text style={footer}>
              This is an automated notification from the EPTSS cron job system.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminSongAssignmentNotification;

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

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 16px 0',
};

const subheading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '24px 0 12px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#e0e0e0',
  margin: '0 0 16px 0',
};

const winnerBox = {
  backgroundColor: '#2a4a2a',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  border: '2px solid #4a7a4a',
};

const winnerLabel = {
  fontSize: '14px',
  color: '#90ee90',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  fontWeight: 'bold',
};

const winnerSong = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 8px 0',
};

const stats = {
  fontSize: '14px',
  color: '#b0b0b0',
  margin: '0',
};

const resultsBox = {
  backgroundColor: '#252525',
  borderRadius: '8px',
  padding: '16px',
  margin: '12px 0 20px 0',
};

const resultItem = {
  fontSize: '14px',
  color: '#e0e0e0',
  margin: '0 0 12px 0',
  lineHeight: '20px',
};

const resultStats = {
  fontSize: '12px',
  color: '#999999',
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
