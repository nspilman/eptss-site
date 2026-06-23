import { describe, expect, it } from "vitest";
import { parseDuplicateTrackId } from "./plyr-upload";

describe("parseDuplicateTrackId", () => {
  it("pulls the existing track id out of plyr's dedup rejection", () => {
    expect(
      parseDuplicateTrackId("duplicate upload: track already exists (id: 1083)"),
    ).toBe("1083");
  });

  it("tolerates whitespace after the colon", () => {
    expect(
      parseDuplicateTrackId("duplicate upload: track already exists (id:42)"),
    ).toBe("42");
  });

  it("returns null for unrelated upload failures", () => {
    expect(parseDuplicateTrackId("invalid or expired session")).toBeNull();
    expect(parseDuplicateTrackId("transcode failed")).toBeNull();
  });
});
