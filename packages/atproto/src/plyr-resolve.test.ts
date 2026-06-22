import { describe, it, expect, vi, afterEach } from "vitest";
import { parsePlyrTrackId, resolvePlyrUrlToRecord, PlyrResolveError } from "./plyr";

describe("parsePlyrTrackId", () => {
  it("pulls the id from a track page, embed, and bare-number paste", () => {
    expect(parsePlyrTrackId("https://plyr.fm/track/1147")).toBe(1147);
    expect(parsePlyrTrackId("https://plyr.fm/embed/track/795")).toBe(795);
    expect(parsePlyrTrackId("  1147 ")).toBe(1147);
    // trailing slash / query string don't trip the match
    expect(parsePlyrTrackId("https://plyr.fm/track/42/?ref=x")).toBe(42);
  });

  it("returns null for non-track plyr URLs and junk", () => {
    // albums/playlists are handle/slug-based — not a track
    expect(parsePlyrTrackId("https://plyr.fm/album/alice.bsky.social/demo")).toBeNull();
    expect(parsePlyrTrackId("https://example.com/track/notanumber")).toBeNull();
    expect(parsePlyrTrackId("")).toBeNull();
  });
});

describe("resolvePlyrUrlToRecord", () => {
  afterEach(() => vi.restoreAllMocks());

  const ok = (body: unknown) =>
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(body), { status: 200 }),
    );

  it("returns the strong-ref + owner + hosted media for an indexed track", async () => {
    ok({
      id: 795,
      title: "Pioneer",
      atproto_record_uri: "at://did:plc:abc/fm.plyr.track/3xyz",
      atproto_record_cid: "bafyrecid",
      artist_did: "did:plc:abc",
      image_url: "https://images.plyr.fm/i/cover.jpg",
      r2_url: "https://audio.plyr.fm/a/song.wav",
    });
    const r = await resolvePlyrUrlToRecord("https://plyr.fm/track/795");
    expect(r).toEqual({
      trackId: 795,
      uri: "at://did:plc:abc/fm.plyr.track/3xyz",
      cid: "bafyrecid",
      artistDid: "did:plc:abc",
      title: "Pioneer",
      imageUrl: "https://images.plyr.fm/i/cover.jpg",
      audioUrl: "https://audio.plyr.fm/a/song.wav",
    });
  });

  it("rejects an unparseable URL before making any request", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    await expect(resolvePlyrUrlToRecord("https://plyr.fm/album/x/y")).rejects.toMatchObject({
      reason: "unparseable",
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it("maps a 404 to a not-found PlyrResolveError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 404 }));
    await expect(resolvePlyrUrlToRecord("https://plyr.fm/track/9999")).rejects.toBeInstanceOf(
      PlyrResolveError,
    );
    await expect(resolvePlyrUrlToRecord("https://plyr.fm/track/9999")).rejects.toMatchObject({
      reason: "not-found",
    });
  });

  it("flags a track that has no atproto record yet as not-indexed", async () => {
    ok({ id: 1, title: "x", atproto_record_uri: null, atproto_record_cid: null, artist_did: null });
    await expect(resolvePlyrUrlToRecord("https://plyr.fm/track/1")).rejects.toMatchObject({
      reason: "not-indexed",
    });
  });
});
