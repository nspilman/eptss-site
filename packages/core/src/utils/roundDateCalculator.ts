/**
 * Utility functions for calculating quarterly round dates
 * 
 * Round Structure:
 * - Quarters start: Jan 1, Apr 1, Jul 1, Oct 1
 * - Signup opens: Immediately (at round creation)
 * - Voting opens: 2 weeks after quarter starts
 * - Voting ends (covering begins): 1 week after voting opens
 * - Covers due & Listening party: 2 weeks after quarter ends
 * 
 * This ensures the listening party and next round's voting opening are on the same day
 */

/**
 * Get the start date of a quarter (Jan 1, Apr 1, Jul 1, or Oct 1)
 */
export function getQuarterStartDate(year: number, quarter: 1 | 2 | 3 | 4): Date {
  const month = (quarter - 1) * 3; // 0, 3, 6, 9 for Jan, Apr, Jul, Oct
  return new Date(year, month, 1, 0, 0, 0, 0);
}

/**
 * Get the end date of a quarter (last day of Mar, Jun, Sep, or Dec)
 */
export function getQuarterEndDate(year: number, quarter: 1 | 2 | 3 | 4): Date {
  const month = quarter * 3; // 3, 6, 9, 12 for Mar, Jun, Sep, Dec
  // Get the last day of the month by going to the 1st of next month and subtracting 1 day
  return new Date(year, month, 0, 23, 59, 59, 999);
}

/**
 * Get the next quarter after a given date
 */
export function getNextQuarter(date: Date): { year: number; quarter: 1 | 2 | 3 | 4 } {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Determine current quarter (0-based month: 0-2=Q1, 3-5=Q2, 6-8=Q3, 9-11=Q4)
  const currentQuarter = Math.floor(month / 3) + 1;
  
  if (currentQuarter === 4) {
    return { year: year + 1, quarter: 1 };
  } else {
    return { year, quarter: (currentQuarter + 1) as 1 | 2 | 3 | 4 };
  }
}

/**
 * Calculate all dates for a quarterly round
 */
export interface QuarterlyRoundDates {
  slug: string;
  signupOpens: Date;
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  listeningParty: Date;
}

export function calculateQuarterlyRoundDates(
  year: number,
  quarter: 1 | 2 | 3 | 4,
  signupOpensDate?: Date
): QuarterlyRoundDates {
  const quarterStart = getQuarterStartDate(year, quarter);
  const quarterEnd = getQuarterEndDate(year, quarter);
  
  // Slug format: YYYY-MM-DD (quarter start date)
  const slug = quarterStart.toISOString().split('T')[0];
  
  // Signup opens: Now (or specified date for future rounds)
  const signupOpens = signupOpensDate || new Date();
  
  // Voting opens: 2 weeks after quarter starts
  const votingOpens = new Date(quarterStart);
  votingOpens.setDate(votingOpens.getDate() + 14);
  
  // Covering begins: 1 week after voting opens (voting lasts 1 week)
  const coveringBegins = new Date(votingOpens);
  coveringBegins.setDate(coveringBegins.getDate() + 7);
  
  // Covers due & Listening party: 2 weeks after quarter ends
  const coversDue = new Date(quarterEnd);
  coversDue.setDate(coversDue.getDate() + 14);
  
  const listeningParty = new Date(coversDue);
  
  return {
    slug,
    signupOpens,
    votingOpens,
    coveringBegins,
    coversDue,
    listeningParty,
  };
}

/**
 * Get the next N quarterly rounds starting from a given date
 */
export function getNextQuarterlyRounds(
  startFromDate: Date,
  count: number
): QuarterlyRoundDates[] {
  const rounds: QuarterlyRoundDates[] = [];
  let currentDate = new Date(startFromDate);
  
  for (let i = 0; i < count; i++) {
    const { year, quarter } = getNextQuarter(currentDate);
    const roundDates = calculateQuarterlyRoundDates(year, quarter, new Date());
    rounds.push(roundDates);
    
    // Move to the next quarter for the next iteration
    currentDate = getQuarterStartDate(year, quarter);
  }
  
  return rounds;
}

/**
 * Parse a round slug (YYYY-MM-DD) to get year and quarter
 */
export function parseRoundSlug(slug: string): { year: number; quarter: 1 | 2 | 3 | 4 } | null {
  const match = slug.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  
  // Determine quarter from month
  if (month === 1) return { year, quarter: 1 };
  if (month === 4) return { year, quarter: 2 };
  if (month === 7) return { year, quarter: 3 };
  if (month === 10) return { year, quarter: 4 };
  
  return null;
}
