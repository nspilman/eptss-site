// Define the types needed for the round page and components
export interface VoteBreakdown {
  title: string;
  artist: string;
  oneCount: number;
  twoCount: number;
  threeCount: number;
  fourCount: number;
  fiveCount: number;
}

export interface VoteResults {
  title: string;
  artist: string;
  average: number;
  votesCount: number;
}

export interface Navigation {
  previous?: number;
  next?: number;
}
