import { describe, it, expect } from "vitest";
import { atUriDid, atUriRkey } from "./at-uri";

describe("atUriDid", () => {
  it("pulls the DID authority from an at:// URI", () => {
    expect(atUriDid("at://did:plc:abc/fm.plyr.track/3kxyz")).toBe("did:plc:abc");
    expect(atUriDid("at://did:plc:pf6/at.atjam.submission/eptss-sub42")).toBe(
      "did:plc:pf6",
    );
  });

  it("returns null for null / undefined / non-at / collection-less URIs", () => {
    expect(atUriDid(null)).toBeNull();
    expect(atUriDid(undefined)).toBeNull();
    expect(atUriDid("https://example.com/x")).toBeNull();
    // no collection slash → nothing to anchor the DID against
    expect(atUriDid("at://did:plc:abc")).toBeNull();
  });
});

describe("atUriRkey", () => {
  it("returns the last path segment", () => {
    expect(atUriRkey("at://did:plc:abc/fm.plyr.track/3kxyz")).toBe("3kxyz");
  });

  it("falls back to the input when there's no slash", () => {
    expect(atUriRkey("3kxyz")).toBe("3kxyz");
  });
});
