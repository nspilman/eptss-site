/**
 * plyr.fm embed helpers.
 *
 * A cover that's been re-hosted to plyr.fm is an `fm.plyr.track` record (in the
 * admin repo), and its audio streams from plyr's branded player. plyr's embed is
 * keyed by a numeric track id (`https://plyr.fm/embed/track/<id>`), but our
 * records are keyed by AT URI — so we bridge them through plyr's public API,
 * which exposes both `id` and `atproto_record_uri` per track.
 */

import { atUriDid } from "./at-uri";

const PLYR_API = "https://api.plyr.fm";

/** The iframe src for a plyr.fm track player. */
export function plyrTrackEmbedUrl(trackId: number | string): string {
  return `https://plyr.fm/embed/track/${trackId}`;
}

/** The canonical plyr.fm track page — a full listen page, not the iframe embed. */
export function plyrTrackPageUrl(trackId: number | string): string {
  return `https://plyr.fm/track/${trackId}`;
}

interface PlyrApiTrack {
  id: number;
  atproto_record_uri?: string;
}

/** A plyr track resolved from a user-pasted URL — the strong-ref plus the bits a
 *  submission needs (owner DID for the ownership guard, hosted cover + audio). */
export interface ResolvedPlyrTrack {
  trackId: number;
  /** The fm.plyr.track record's AT URI — the submission `payload` strong-ref uri. */
  uri: string;
  /** The record CID — the strong-ref cid. */
  cid: string;
  /** The track owner's DID; callers must confirm it matches the submitter. */
  artistDid: string;
  title: string | null;
  /** plyr-hosted cover (images.plyr.fm) — already a trusted, renderable URL. */
  imageUrl: string | null;
  /** plyr-hosted streaming audio (R2). */
  audioUrl: string | null;
}

/** Thrown when a pasted plyr URL can't become a submission deliverable. The
 *  `reason` is a stable code so the submit flow can map it to user-facing copy. */
export class PlyrResolveError extends Error {
  constructor(
    readonly reason: "unparseable" | "not-found" | "not-indexed",
    message: string,
  ) {
    super(message);
    this.name = "PlyrResolveError";
  }
}

/**
 * Pull the numeric track id out of a plyr URL the user pasted. Mirrors plyr's own
 * oEmbed parser (`/track/(\d+)`), so it accepts the track page
 * (`plyr.fm/track/123`) and the embed (`plyr.fm/embed/track/123`) alike; a bare
 * numeric id is allowed too, for the paste-the-number case. Returns null when no
 * track id is present — album/playlist URLs (`/album/{handle}/{slug}`) don't match.
 */
export function parsePlyrTrackId(input: string): number | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const m = trimmed.match(/\/track\/(\d+)/);
  return m ? Number(m[1]) : null;
}

/**
 * Resolve a pasted plyr track URL to the `fm.plyr.track` it points at — the inverse
 * of the migration. plyr already hosts the audio, cover, and record (the user
 * uploaded there directly), so we only read its public `/tracks/{id}` API and hand
 * back the strong-ref plus metadata. The caller must still confirm `artistDid` is the
 * submitting user before assigning it as their deliverable. Throws `PlyrResolveError`
 * with a stable reason on a bad URL, an unknown track, or a track not yet carrying an
 * atproto record.
 */
export async function resolvePlyrUrlToRecord(
  input: string,
  opts: { apiBase?: string } = {},
): Promise<ResolvedPlyrTrack> {
  const trackId = parsePlyrTrackId(input);
  if (trackId == null) {
    throw new PlyrResolveError("unparseable", "That doesn't look like a plyr track link.");
  }
  const apiBase = (opts.apiBase ?? PLYR_API).replace(/\/$/, "");
  const res = await fetch(`${apiBase}/tracks/${trackId}`);
  if (res.status === 404) {
    throw new PlyrResolveError("not-found", `No plyr track found at id ${trackId}.`);
  }
  if (!res.ok) {
    throw new PlyrResolveError("not-found", `Couldn't reach plyr for track ${trackId} (${res.status}).`);
  }
  const t = (await res.json()) as {
    id?: number;
    title?: string | null;
    atproto_record_uri?: string | null;
    atproto_record_cid?: string | null;
    artist_did?: string | null;
    image_url?: string | null;
    r2_url?: string | null;
  };
  if (!t.atproto_record_uri || !t.atproto_record_cid || !t.artist_did) {
    // plyr indexes the row at upload, but the on-network record may lag a beat.
    throw new PlyrResolveError(
      "not-indexed",
      "That track isn't on the network yet — give plyr a moment after uploading, then retry.",
    );
  }
  return {
    trackId,
    uri: t.atproto_record_uri,
    cid: t.atproto_record_cid,
    artistDid: t.artist_did,
    title: t.title ?? null,
    imageUrl: t.image_url ?? null,
    audioUrl: t.r2_url ?? null,
  };
}

/**
 * Index a repo's plyr tracks by AT URI → plyr numeric id, so we can turn an
 * `fm.plyr.track` record URI into an embeddable player. Paginates plyr's public
 * `/tracks/?artist_did=` listing. Best-effort: on any failure it returns
 * whatever it has, so a plyr outage just means no embeds (the page still renders).
 */
export async function fetchPlyrTrackIndex(
  did: string,
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  let cursor: string | undefined;
  try {
    do {
      const url = new URL(`${PLYR_API}/tracks/`);
      url.searchParams.set("artist_did", did);
      url.searchParams.set("limit", "100");
      if (cursor) url.searchParams.set("cursor", cursor);
      const res = await fetch(url.toString(), {
        cache: "force-cache",
      } as RequestInit);
      if (!res.ok) break;
      const data = (await res.json()) as {
        tracks?: PlyrApiTrack[];
        next_cursor?: string | null;
      };
      for (const t of data.tracks ?? []) {
        if (t.atproto_record_uri) out.set(t.atproto_record_uri, t.id);
      }
      cursor = data.next_cursor ?? undefined;
    } while (cursor);
  } catch {
    // best-effort
  }
  return out;
}

/**
 * Resolve a set of `fm.plyr.track` record URIs to their plyr numeric ids — the
 * bridge both the round embed and the profile listen-link need. Groups by repo
 * DID so each repo's track listing is page-walked once. Best-effort: URIs plyr
 * doesn't know are simply absent from the returned map.
 */
export async function resolvePlyrTrackIds(
  uris: Iterable<string>,
): Promise<Map<string, number>> {
  const want = [...uris];
  const dids = new Set<string>();
  for (const u of want) {
    const did = atUriDid(u);
    if (did) dids.add(did);
  }
  const byUri = new Map<string, number>();
  await Promise.all(
    [...dids].map(async (did) => {
      for (const [u, id] of await fetchPlyrTrackIndex(did)) byUri.set(u, id);
    }),
  );
  const out = new Map<string, number>();
  for (const u of want) {
    const id = byUri.get(u);
    if (id != null) out.set(u, id);
  }
  return out;
}
