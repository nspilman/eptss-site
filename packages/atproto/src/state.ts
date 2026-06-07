/**
 * Pure round-state logic, ported from @atjam/lexicons. A round has no status
 * field — its state and current phase derive from its milestones.
 */
import type { Round, RoundState } from "./types";

/**
 * Derive a round's coarse state from its milestones.
 *   open        — no submission-deadline reached yet (and no signup-deadline passed)
 *   in-progress — signup-deadline passed, submission-deadline hasn't
 *   closed      — submission-deadline passed
 */
export function deriveState(round: Round, now: Date = new Date()): RoundState {
  const dateOf = (label: string) =>
    round.milestones.find((m) => m.label === label)?.date;

  const submissionDeadline = dateOf("submission-deadline");
  if (submissionDeadline && now >= new Date(submissionDeadline)) return "closed";

  const signupDeadline = dateOf("signup-deadline");
  if (signupDeadline && now >= new Date(signupDeadline)) return "in-progress";

  return "open";
}
