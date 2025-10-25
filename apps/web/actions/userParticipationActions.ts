// Re-export user participation actions from data-access
// This file configures rate limiters for the web app
import { setRateLimiters } from "@eptss/data-access";
import { votingRateLimit, submissionRateLimit, signupRateLimit, emailRateLimit } from "@/lib/ratelimit";

// Configure rate limiters for data-access actions
setRateLimiters({
  voting: votingRateLimit,
  submission: submissionRateLimit,
  signup: signupRateLimit,
  email: emailRateLimit,
});

// Re-export all actions from data-access
export {
  submitVotes,
  submitCover,
  signup,
  signupWithOTP,
  completeSignupAfterVerification,
  verifySignupByEmail,
} from "@eptss/data-access";
