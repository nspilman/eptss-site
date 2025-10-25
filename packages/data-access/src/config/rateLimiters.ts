// Rate limiting configuration for user participation actions
// This file does NOT have "use server" so it can export non-async functions

export interface RateLimiter {
  limit(key: string): Promise<{ success: boolean }>;
}

// Default no-op rate limiter (always allows)
const defaultRateLimiter: RateLimiter = {
  limit: async () => ({ success: true }),
};

// These can be overridden by the consuming application
export let votingRateLimit: RateLimiter = defaultRateLimiter;
export let submissionRateLimit: RateLimiter = defaultRateLimiter;
export let signupRateLimit: RateLimiter = defaultRateLimiter;
export let emailRateLimit: RateLimiter = defaultRateLimiter;

export function setRateLimiters(limiters: {
  voting?: RateLimiter;
  submission?: RateLimiter;
  signup?: RateLimiter;
  email?: RateLimiter;
}) {
  if (limiters.voting) votingRateLimit = limiters.voting;
  if (limiters.submission) submissionRateLimit = limiters.submission;
  if (limiters.signup) signupRateLimit = limiters.signup;
  if (limiters.email) emailRateLimit = limiters.email;
}
