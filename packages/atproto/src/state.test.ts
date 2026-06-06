import { describe, it, expect } from "vitest";
import { deriveState, deriveCurrentPhase } from "./state";
import type { Milestone, Round } from "./types";

// deriveState/deriveCurrentPhase read only `round.milestones`, so a minimal
// shape is enough to exercise them.
const roundWith = (milestones: Milestone[]): Round =>
  ({ milestones } as unknown as Round);

const iso = (d: string) => new Date(d).toISOString();

describe("deriveState", () => {
  const NOW = new Date("2024-06-15T00:00:00Z");

  it("is open before any deadline passes", () => {
    const r = roundWith([
      { label: "signup-deadline", date: iso("2024-07-01") },
      { label: "submission-deadline", date: iso("2024-08-01") },
    ]);
    expect(deriveState(r, NOW)).toBe("open");
  });

  it("is in-progress once signup-deadline passes but submission-deadline has not", () => {
    const r = roundWith([
      { label: "signup-deadline", date: iso("2024-06-01") },
      { label: "submission-deadline", date: iso("2024-08-01") },
    ]);
    expect(deriveState(r, NOW)).toBe("in-progress");
  });

  it("is closed once submission-deadline passes", () => {
    const r = roundWith([
      { label: "signup-deadline", date: iso("2024-05-01") },
      { label: "submission-deadline", date: iso("2024-06-01") },
    ]);
    expect(deriveState(r, NOW)).toBe("closed");
  });

  it("closes exactly at the submission-deadline boundary (>=)", () => {
    const r = roundWith([
      { label: "submission-deadline", date: iso("2024-06-15T00:00:00Z") },
    ]);
    expect(deriveState(r, NOW)).toBe("closed");
  });

  it("is open with no deadline milestones at all", () => {
    expect(deriveState(roundWith([]), NOW)).toBe("open");
  });
});

describe("deriveCurrentPhase", () => {
  const milestones: Milestone[] = [
    { label: "a", date: iso("2024-01-01") },
    { label: "b", date: iso("2024-02-01") },
    { label: "c", date: iso("2024-03-01") },
  ];

  it("counts passed milestones and brackets now between since/until", () => {
    const phase = deriveCurrentPhase(roundWith(milestones), new Date("2024-02-15"));
    expect(phase.index).toBe(2);
    expect(phase.since?.label).toBe("b");
    expect(phase.until?.label).toBe("c");
  });

  it("before the first milestone: index 0, no since", () => {
    const phase = deriveCurrentPhase(roundWith(milestones), new Date("2023-12-01"));
    expect(phase.index).toBe(0);
    expect(phase.since).toBeUndefined();
    expect(phase.until?.label).toBe("a");
  });

  it("after the last milestone: index = count, no until", () => {
    const phase = deriveCurrentPhase(roundWith(milestones), new Date("2024-04-01"));
    expect(phase.index).toBe(3);
    expect(phase.since?.label).toBe("c");
    expect(phase.until).toBeUndefined();
  });

  it("sorts milestones by date regardless of input order", () => {
    const shuffled = roundWith([milestones[2], milestones[0], milestones[1]]);
    const phase = deriveCurrentPhase(shuffled, new Date("2024-02-15"));
    expect(phase.index).toBe(2);
    expect(phase.since?.label).toBe("b");
    expect(phase.until?.label).toBe("c");
  });
});
