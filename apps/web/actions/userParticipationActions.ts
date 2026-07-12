"use server";

// The web app's participation actions: @eptss/actions cores + web-only concerns
// (rate limiters, the atproto signup mirror). Client components import from here,
// never from @eptss/actions directly, so the web layer can compose around the core.
import { setRateLimiters } from "@eptss/core";
import { getAuthUser } from "@eptss/auth/server";
import {
  signup as signupCore,
  signupForRound as signupForRoundCore,
  signupWithOTP as signupWithOTPCore,
} from "@eptss/actions";
import type { FormReturn } from "@eptss/core/types/index";
import { votingRateLimit, submissionRateLimit, signupRateLimit, emailRateLimit } from "@/lib/ratelimit";
import { recordSignupOnNetwork } from "@/lib/atproto/native-signup";

// Configure rate limiters for data-access actions
setRateLimiters({
  voting: votingRateLimit,
  submission: submissionRateLimit,
  signup: signupRateLimit,
  email: emailRateLimit,
});

/**
 * Mirror a just-created signup to the network when it's the SESSION user's own
 * (a linked user's at.atjam.signup is born owned — nothing to migrate later).
 * Best-effort: an admin acting for someone else, an unlinked account, or any
 * failure is a silent skip; the migrate-on-link net catches those later.
 */
async function mirrorOwnSignup(roundId: number, targetUserId?: string): Promise<void> {
  if (!Number.isInteger(roundId) || roundId <= 0) return;
  const { userId: sessionUserId } = await getAuthUser();
  if (!sessionUserId) return;
  if (targetUserId && targetUserId !== sessionUserId) return; // only ever as oneself
  await recordSignupOnNetwork(sessionUserId, roundId);
}

/** Round signup (with a nominated song — the song stays in Postgres). */
export async function signup(
  formData: FormData,
  providedUserId?: string,
): Promise<FormReturn> {
  const result = await signupCore(formData, providedUserId);
  if (result.status === "Success") {
    await mirrorOwnSignup(Number(formData.get("roundId")), providedUserId);
  }
  return result;
}

/** Song-free signup (covering-phase / late signup). */
export async function signupForRound(formData: FormData): Promise<FormReturn> {
  const result = await signupForRoundCore(formData);
  if (result.status === "Success") {
    await mirrorOwnSignup(
      Number(formData.get("roundId")),
      formData.get("userId")?.toString(),
    );
  }
  return result;
}

/**
 * Pass-through with no web-layer composition: a new user signing up via OTP
 * can't be linked yet, so there is nothing to mirror — their signup comes home
 * via the link→migrate flow. Declared (not re-exported) because a "use server"
 * file may only export async functions it declares; `export { x } from` breaks
 * `next build` even when x is async.
 */
export async function signupWithOTP(formData: FormData): Promise<FormReturn> {
  return signupWithOTPCore(formData);
}
