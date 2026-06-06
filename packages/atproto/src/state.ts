/**
 * Pure round-state logic, ported from @atjam/lexicons. A round has no status
 * field — its state and current phase derive from its milestones.
 */
import type { Milestone, Round, RoundState } from "./types";

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

export interface RoundPhase {
  index: number;
  since?: Milestone;
  until?: Milestone;
}

/** Where `now` falls among the (date-sorted) milestones. */
export function deriveCurrentPhase(
  round: Round,
  now: Date = new Date(),
): RoundPhase {
  const t = now.getTime();
  const sorted = [...round.milestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const passed = sorted.filter((m) => new Date(m.date).getTime() <= t).length;
  return {
    index: passed,
    since: passed > 0 ? sorted[passed - 1] : undefined,
    until: passed < sorted.length ? sorted[passed] : undefined,
  };
}

export interface StateVisual {
  label: string;
  /** Text color utility (the state's hue). */
  text: string;
  /** Tinted background utility (an alpha of the hue). */
  tint: string;
  /** Solid track/segment color (transit line). */
  track: string;
}

export const STATE_VISUALS: Record<RoundState, StateVisual> = {
  open: {
    label: "open",
    text: "text-state-open",
    tint: "bg-state-open/15",
    track: "bg-state-open",
  },
  "in-progress": {
    label: "in-progress",
    text: "text-state-progress",
    tint: "bg-state-progress/15",
    track: "bg-state-progress",
  },
  closed: {
    label: "closed",
    text: "text-state-closed",
    tint: "bg-state-closed/15",
    track: "bg-state-closed",
  },
};
