import { describe, it, expect } from "vitest";
import { deriveState } from "./state";
import type { Milestone, Round } from "./types";

// deriveState reads only `round.milestones`, so a minimal shape is enough to
// exercise it.
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
