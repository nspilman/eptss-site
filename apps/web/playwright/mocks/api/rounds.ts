/**
 * Mock round data for integration tests
 *
 * Matches the RoundInfo type from the codebase
 */

export type Phase = 'signups' | 'voting' | 'covering' | 'celebration';

export interface DateLabel {
  opens: string;
  closes: string;
}

export interface MockSong {
  id: number;
  title: string;
  artist: string;
}

export interface MockSubmission {
  roundId: number;
  username: string;
  publicDisplayName?: string | null;
  userId: string;
  createdAt: Date;
  soundcloudUrl?: string | null;
  audioFileUrl?: string | null;
  coverImageUrl?: string | null;
  audioDuration?: number | null;
  audioFileSize?: number | null;
}

export interface MockSignup {
  id: number;
  userId: string;
  username: string;
  publicDisplayName?: string | null;
  roundId: number;
  songId?: number | null;
  youtubeLink?: string | null;
  additionalComments?: string | null;
  createdAt: Date;
}

export interface MockVoteOption {
  roundId: number;
  songId: number;
  youtubeLink?: string;
  song: Pick<MockSong, 'title' | 'artist'>;
}

export interface MockRound {
  roundId: number;
  slug: string;
  phase: Phase;
  song: Pick<MockSong, 'title' | 'artist'>;
  dateLabels: Record<Phase, DateLabel>;
  hasRoundStarted: boolean;
  areSubmissionsOpen: boolean;
  isVotingOpen: boolean;
  voteOptions: MockVoteOption[];
  submissions: MockSubmission[];
  playlistUrl?: string;
  signups: MockSignup[];
  signupCount?: number;
  submissionCount?: number;
  signupOpens: Date;
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  listeningParty: Date;
  votingEnabled: boolean;
}

/**
 * Create mock date labels for a phase
 */
function createDateLabels(baseDate: Date): Record<Phase, DateLabel> {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const signupOpens = new Date(baseDate);
  const votingOpens = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
  const coveringBegins = new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 days
  const coversDue = new Date(baseDate.getTime() + 28 * 24 * 60 * 60 * 1000); // +28 days
  const listeningParty = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

  return {
    signups: {
      opens: formatDate(signupOpens),
      closes: formatDate(votingOpens),
    },
    voting: {
      opens: formatDate(votingOpens),
      closes: formatDate(coveringBegins),
    },
    covering: {
      opens: formatDate(coveringBegins),
      closes: formatDate(coversDue),
    },
    celebration: {
      opens: formatDate(coversDue),
      closes: formatDate(listeningParty),
    },
  };
}

/**
 * Create a mock round with sensible defaults
 */
export function createMockRound(overrides: Partial<MockRound> = {}): MockRound {
  const now = new Date();
  const baseDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  return {
    roundId: overrides.roundId ?? 1,
    slug: overrides.slug ?? 'round-1',
    phase: overrides.phase ?? 'covering',
    song: overrides.song ?? { title: 'Test Song', artist: 'Test Artist' },
    dateLabels: overrides.dateLabels ?? createDateLabels(baseDate),
    hasRoundStarted: overrides.hasRoundStarted ?? true,
    areSubmissionsOpen: overrides.areSubmissionsOpen ?? true,
    isVotingOpen: overrides.isVotingOpen ?? false,
    voteOptions: overrides.voteOptions ?? [],
    submissions: overrides.submissions ?? [],
    playlistUrl: overrides.playlistUrl,
    signups: overrides.signups ?? [],
    signupCount: overrides.signupCount ?? overrides.signups?.length ?? 0,
    submissionCount: overrides.submissionCount ?? overrides.submissions?.length ?? 0,
    signupOpens: overrides.signupOpens ?? baseDate,
    votingOpens: overrides.votingOpens ?? new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    coveringBegins:
      overrides.coveringBegins ?? new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
    coversDue: overrides.coversDue ?? new Date(baseDate.getTime() + 28 * 24 * 60 * 60 * 1000),
    listeningParty:
      overrides.listeningParty ?? new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
    votingEnabled: overrides.votingEnabled ?? true,
  };
}

/**
 * Pre-defined mock rounds for common test scenarios
 */
export const mockRounds = {
  /**
   * Round in signups phase
   */
  signupsPhase: createMockRound({
    roundId: 10,
    slug: 'round-10-signups',
    phase: 'signups',
    hasRoundStarted: true,
    areSubmissionsOpen: false,
    isVotingOpen: false,
    voteOptions: [
      { roundId: 10, songId: 1, song: { title: 'Song Option 1', artist: 'Artist 1' } },
      { roundId: 10, songId: 2, song: { title: 'Song Option 2', artist: 'Artist 2' } },
      { roundId: 10, songId: 3, song: { title: 'Song Option 3', artist: 'Artist 3' } },
    ],
  }),

  /**
   * Round in voting phase
   */
  votingPhase: createMockRound({
    roundId: 11,
    slug: 'round-11-voting',
    phase: 'voting',
    hasRoundStarted: true,
    areSubmissionsOpen: false,
    isVotingOpen: true,
    voteOptions: [
      { roundId: 11, songId: 4, song: { title: 'Vote Song 1', artist: 'Vote Artist 1' } },
      { roundId: 11, songId: 5, song: { title: 'Vote Song 2', artist: 'Vote Artist 2' } },
    ],
    signups: [
      {
        id: 1,
        userId: '11111111-1111-1111-1111-111111111111',
        username: 'testuser1',
        roundId: 11,
        createdAt: new Date(),
      },
    ],
  }),

  /**
   * Round in covering phase
   */
  coveringPhase: createMockRound({
    roundId: 12,
    slug: 'round-12-covering',
    phase: 'covering',
    song: { title: 'Cover This Song', artist: 'Famous Artist' },
    hasRoundStarted: true,
    areSubmissionsOpen: true,
    isVotingOpen: false,
    signups: [
      {
        id: 2,
        userId: '11111111-1111-1111-1111-111111111111',
        username: 'regularuser',
        publicDisplayName: 'Regular User',
        roundId: 12,
        createdAt: new Date(),
      },
    ],
    signupCount: 1,
  }),

  /**
   * Round in celebration phase with submissions
   */
  celebrationPhase: createMockRound({
    roundId: 13,
    slug: 'round-13-celebration',
    phase: 'celebration',
    song: { title: 'Celebrated Song', artist: 'Great Artist' },
    hasRoundStarted: true,
    areSubmissionsOpen: false,
    isVotingOpen: false,
    playlistUrl: 'https://soundcloud.com/example/playlist',
    submissions: [
      {
        roundId: 13,
        username: 'regularuser',
        publicDisplayName: 'Regular User',
        userId: '11111111-1111-1111-1111-111111111111',
        createdAt: new Date(),
        audioFileUrl: 'https://example.com/audio1.mp3',
        audioDuration: 180000,
      },
      {
        roundId: 13,
        username: 'anotheruser',
        publicDisplayName: 'Another User',
        userId: '66666666-6666-6666-6666-666666666666',
        createdAt: new Date(),
        audioFileUrl: 'https://example.com/audio2.mp3',
        audioDuration: 210000,
      },
    ],
    submissionCount: 2,
    signupCount: 2,
  }),

  /**
   * Round that hasn't started yet
   */
  notStarted: createMockRound({
    roundId: 14,
    slug: 'round-14-future',
    phase: 'signups',
    hasRoundStarted: false,
    areSubmissionsOpen: false,
    isVotingOpen: false,
  }),
};

export type MockRoundKey = keyof typeof mockRounds;
