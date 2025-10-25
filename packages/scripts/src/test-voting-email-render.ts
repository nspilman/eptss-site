import * as React from 'react';
import { render } from '@react-email/render';
import { VotingConfirmation } from '@eptss/email/templates/VotingConfirmation';

async function testVotingEmailRender() {
  try {
    const html = await render(
      React.createElement(VotingConfirmation, {
        userEmail: 'test@example.com',
        userName: 'Test User',
        roundName: 'Test Round',
        roundSlug: 'test-round',
        votedSongs: [
          { title: 'Bohemian Rhapsody', artist: 'Queen', rating: 5 },
          { title: 'Stairway to Heaven', artist: 'Led Zeppelin', rating: 4 },
        ],
        roundUrl: 'https://example.com/round/test',
        baseUrl: 'https://example.com',
        phaseDates: {
          coveringBegins: 'Jan 15, 2025',
          coversDue: 'Feb 5, 2025',
          listeningParty: 'Feb 8, 2025',
        },
      })
    );

    console.log('HTML Length:', html.length);
    console.log('HTML Preview (first 500 chars):', html.substring(0, 500));
    console.log('\nFull HTML:\n', html);
  } catch (error) {
    console.error('Error rendering voting email:', error);
  }
}

testVotingEmailRender();
