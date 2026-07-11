import { describe, it, expect } from "vitest";
import { transformRound } from "./transform";
import type { RoundExport, SubmissionExport } from "./extract";

const JAM = { uri: "at://did:plc:eptss/at.atjam.jam/eptss", cid: "bafyjam" };

function makeRound(overrides: Partial<RoundExport> = {}): RoundExport {
  return {
    id: 29,
    slug: "round-29",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    chosenSong: { title: "Bags", artist: "Clairo" },
    promptText: null,
    playlistUrl: null,
    signupOpens: new Date("2024-01-02T00:00:00Z"),
    votingOpens: new Date("2024-01-09T00:00:00Z"),
    coveringBegins: new Date("2024-01-16T00:00:00Z"),
    coversDue: new Date("2024-02-01T00:00:00Z"),
    listeningParty: new Date("2024-02-08T00:00:00Z"),
    signups: [],
    voteResults: [],
    submissions: [],
    ...overrides,
  };
}

function sub(
  id: number,
  url: string | null = "https://soundcloud.com/u/track",
): SubmissionExport {
  return {
    id,
    userId: `user-${id}`,
    username: `user${id}`,
    url,
    note: null,
    createdAt: new Date("2024-01-20T00:00:00Z"),
  };
}

describe("transformRound", () => {
  it("derives rkeys from postgres ids via the shared scheme", () => {
    const out = transformRound(makeRound({ id: 7, submissions: [sub(42)] }), {
      jam: JAM,
    });
    expect(out.rkey).toBe("eptss-r7");
    expect(out.submissions[0].rkey).toBe("eptss-sub42");
  });

  it("maps EPTSS phases to milestones (coversDue -> submission-deadline, listeningParty -> closing-event), sorted", () => {
    const out = transformRound(makeRound(), { jam: JAM });
    expect(out.record.milestones.map((m) => m.label)).toEqual([
      "signup-opens",
      "voting-opens",
      "covering-begins",
      "submission-deadline",
      "closing-event",
    ]);
    expect(out.valid).toBe(true);
  });

  it("omits dateless phases and flags invalid when no milestones remain", () => {
    const out = transformRound(
      makeRound({
        signupOpens: null,
        votingOpens: null,
        coveringBegins: null,
        coversDue: null,
        listeningParty: null,
      }),
      { jam: JAM },
    );
    expect(out.record.milestones).toHaveLength(0);
    expect(out.valid).toBe(false);
    expect(out.warnings.some((w) => /milestone/i.test(w))).toBe(true);
  });

  // The DAG-CBOR float regression: a vote record must carry integer total +
  // count, never a floating-point average (floats are rejected by the PDS).
  it("carries integer vote totals + counts, never a float average", () => {
    const out = transformRound(
      makeRound({
        voteResults: [{ title: "Bags", artist: "Clairo", total: 35, count: 9 }],
      }),
      { jam: JAM },
    );
    const selection = (out.record.subject as Record<string, any>).selection;
    expect(selection.voteResults[0]).toEqual({
      title: "Bags",
      artist: "Clairo",
      total: 35,
      count: 9,
    });
    expect(selection.voteResults[0]).not.toHaveProperty("average");
    expect(Number.isInteger(selection.voteResults[0].total)).toBe(true);
  });

  it("extracts a clean /sets/ playlist link out of an embed blob", () => {
    const embed =
      '<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/123"></iframe>' +
      '<a href="https://soundcloud.com/eptss/sets/round-29">round 29</a>';
    const out = transformRound(makeRound({ playlistUrl: embed }), { jam: JAM });
    expect((out.record.closingEvent as Record<string, any>).playlistUrl).toBe(
      "https://soundcloud.com/eptss/sets/round-29",
    );
  });

  it("passes a bare playlist URL through unchanged", () => {
    const out = transformRound(
      makeRound({ playlistUrl: "https://soundcloud.com/eptss/sets/x" }),
      { jam: JAM },
    );
    expect((out.record.closingEvent as Record<string, any>).playlistUrl).toBe(
      "https://soundcloud.com/eptss/sets/x",
    );
  });

  it("skips submissions with no deliverable url, with a warning", () => {
    const out = transformRound(
      makeRound({
        submissions: [sub(1, "https://soundcloud.com/a/x"), sub(2, null)],
      }),
      { jam: JAM },
    );
    expect(out.submissions.map((s) => s.sourceSubmissionId)).toEqual([1]);
    expect(out.warnings.some((w) => /no audio URL/i.test(w))).toBe(true);
  });
});
