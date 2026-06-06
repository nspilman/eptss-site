import { describe, it, expect } from "vitest";
import { applyClaims } from "./claim-view";
import type { RecordEnvelope, Submission } from "./types";

const ADMIN = "did:plc:admin";
const USER = "did:plc:user";

function sub(id: number, repo = ADMIN): RecordEnvelope<Submission> {
  return {
    uri: `at://${repo}/at.atjam.submission/eptss-sub${id}`,
    cid: `cid-${id}`,
    value: {
      round: { uri: "at://did:plc:admin/at.atjam.round/eptss-r1", cid: "cid-r1" },
      url: `https://soundcloud.com/u/track-${id}`,
      createdAt: "2024-01-01T00:00:00Z",
    },
  };
}

describe("applyClaims", () => {
  it("is a no-op (same reference) when the claim map is empty", () => {
    const subs = [sub(1), sub(2)];
    expect(applyClaims(subs, new Map())).toBe(subs);
  });

  it("rewrites a claimed submission's uri to its user-repo home", () => {
    const claimedUri = `at://${USER}/at.atjam.submission/eptss-sub1`;
    const out = applyClaims([sub(1), sub(2)], new Map([[1, claimedUri]]));
    expect(out[0].uri).toBe(claimedUri);
    expect(out[1].uri).toBe(sub(2).uri); // untouched
  });

  it("preserves cid and value (only the home changes)", () => {
    const original = sub(1);
    const claimedUri = `at://${USER}/at.atjam.submission/eptss-sub1`;
    const [out] = applyClaims([original], new Map([[1, claimedUri]]));
    expect(out.cid).toBe(original.cid);
    expect(out.value).toEqual(original.value);
  });

  it("leaves submissions whose id isn't in the map untouched", () => {
    const out = applyClaims([sub(5)], new Map([[1, "at://x/y/z"]]));
    expect(out[0].uri).toBe(sub(5).uri);
  });

  it("ignores records whose rkey isn't an eptss submission key", () => {
    const foreign: RecordEnvelope<Submission> = {
      uri: "at://did:plc:x/at.atjam.submission/3labc",
      cid: "cid-x",
      value: sub(1).value,
    };
    const out = applyClaims([foreign], new Map([[1, "at://x/y/z"]]));
    expect(out[0].uri).toBe(foreign.uri);
  });
});
