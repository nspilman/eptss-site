import { describe, it, expect } from "vitest";
import {
  eptssSubmissionRkey,
  eptssRoundRkey,
  eptssSignupRkey,
  eptssSubmissionId,
  eptssRoundId,
  eptssSignupId,
} from "./eptss-rkey";

describe("eptss rkey scheme", () => {
  describe("submission encode/decode round-trip", () => {
    for (const id of [1, 9, 42, 332, 1_000_000]) {
      it(`round-trips submission id ${id}`, () => {
        expect(eptssSubmissionId(eptssSubmissionRkey(id))).toBe(id);
      });
    }

    it("encodes to the documented shape", () => {
      expect(eptssSubmissionRkey(42)).toBe("eptss-sub42");
    });

    it("decodes from a full AT URI", () => {
      expect(
        eptssSubmissionId("at://did:plc:abc/at.atjam.submission/eptss-sub42"),
      ).toBe(42);
    });
  });

  describe("round encode/decode round-trip", () => {
    for (const id of [1, 29, 332]) {
      it(`round-trips round id ${id}`, () => {
        expect(eptssRoundId(eptssRoundRkey(id))).toBe(id);
      });
    }

    it("encodes to the documented shape", () => {
      expect(eptssRoundRkey(29)).toBe("eptss-r29");
    });

    it("decodes from a full AT URI", () => {
      expect(eptssRoundId("at://did:plc:abc/at.atjam.round/eptss-r29")).toBe(29);
    });
  });

  describe("signup encode/decode round-trip", () => {
    for (const id of [1, 3, 29, 332]) {
      it(`round-trips signup id ${id}`, () => {
        expect(eptssSignupId(eptssSignupRkey(id))).toBe(id);
      });
    }

    it("encodes to the documented shape", () => {
      expect(eptssSignupRkey(29)).toBe("eptss-sig29");
    });

    it("decodes from a full AT URI", () => {
      expect(eptssSignupId("at://did:plc:abc/at.atjam.signup/eptss-sig29")).toBe(29);
    });
  });

  // The whole reason this module exists: encode and decode must agree, and the
  // three key families must not be mistaken for each other (or attribution would
  // silently route to the wrong record). The submission and signup families share
  // the `eptss-s` prefix, so their mutual rejection is the case that matters most.
  describe("rejects foreign / malformed keys", () => {
    it("the submission decoder rejects a round key", () => {
      expect(eptssSubmissionId(eptssRoundRkey(42))).toBeNull();
    });

    it("the round decoder rejects a submission key", () => {
      expect(eptssRoundId(eptssSubmissionRkey(42))).toBeNull();
    });

    it("the submission decoder rejects a signup key (shared eptss-s prefix)", () => {
      expect(eptssSubmissionId(eptssSignupRkey(42))).toBeNull();
    });

    it("the signup decoder rejects a submission key (shared eptss-s prefix)", () => {
      expect(eptssSignupId(eptssSubmissionRkey(42))).toBeNull();
    });

    it("the signup decoder rejects a round key", () => {
      expect(eptssSignupId(eptssRoundRkey(42))).toBeNull();
    });

    it("rejects keys with no numeric id", () => {
      expect(eptssSubmissionId("eptss-sub")).toBeNull();
      expect(eptssSubmissionId("eptss-subABC")).toBeNull();
      expect(eptssRoundId("eptss-r")).toBeNull();
      expect(eptssSignupId("eptss-sig")).toBeNull();
    });

    it("rejects unrelated rkeys", () => {
      expect(eptssSubmissionId("3labc2def")).toBeNull();
      expect(eptssRoundId("self")).toBeNull();
      expect(eptssSignupId("3labc2def")).toBeNull();
    });
  });
});
