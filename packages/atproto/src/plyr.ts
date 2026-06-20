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
