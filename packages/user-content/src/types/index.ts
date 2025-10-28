/**
 * Types for the user-content package
 */

export type ReflectionType = 'initial' | 'checkin';

export interface Reflection {
  id: string;
  userId: string;
  roundId: number;
  title: string;
  slug: string;
  markdownContent: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tags?: string[];
}

export interface Round {
  roundId: number;
  slug: string;
  signupOpens: Date | string;
  votingOpens: Date | string;
  coveringBegins: Date | string;
  coversDue: Date | string;
  listeningParty: Date | string;
  playlistUrl: string;
  song: { artist: string; title: string };
  signupCount?: number;
  submissionCount?: number;
}

export interface CreateReflectionInput {
  userId: string;
  roundId: number;
  title: string;
  markdownContent: string;
  isPublic?: boolean;
  reflectionType?: ReflectionType;
}
