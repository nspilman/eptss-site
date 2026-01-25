// Re-export user participation actions from actions package
// This file configures rate limiters for the web app
import { setRateLimiters } from "@eptss/core";
import { votingRateLimit, submissionRateLimit, signupRateLimit, emailRateLimit } from "@/lib/ratelimit";

// Configure rate limiters for data-access actions
setRateLimiters({
  voting: votingRateLimit,
  submission: submissionRateLimit,
  signup: signupRateLimit,
  email: emailRateLimit,
});

// Re-export all actions from @eptss/actions
export {
  submitCover,
  signup,
  signupWithOTP,
  signupForRound,
  completeSignupAfterVerification,
  verifySignupByEmail,
  signout,
} from "@eptss/actions";
