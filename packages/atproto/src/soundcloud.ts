/**
 * SoundCloud embedding helpers.
 *
 * Many backfilled track URLs are from 2020 and have gone stale (users renamed
 * accounts), so we don't trust a page URL directly: we resolve it through
 * SoundCloud's oEmbed, which 404s for dead links and, for live ones, returns
 * the canonical `api.soundcloud.com/{tracks,playlists}/<id>` reference the
 * widget actually needs. A round's playlist *set* is the most reliable source —
 * it holds the current track references even when individual links rotted.
 */

export function isSoundCloud(url: string): boolean {
  try {
    return /(^|\.)soundcloud\.com$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * Resolve a SoundCloud track/set page URL to a working widget player `src`,
 * or null if oEmbed can't resolve it (stale/deleted). `visual` picks the
 * larger artwork player (nice for a set); compact otherwise.
 */
export async function resolveSoundCloudPlayer(
  pageUrl: string,
  opts?: { visual?: boolean },
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(pageUrl)}`,
      { cache: "force-cache" } as RequestInit,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { html?: string };
    const srcMatch = /src="([^"]+)"/.exec(data.html ?? "");
    if (!srcMatch) return null;
    const resolved = new URL(srcMatch[1]).searchParams.get("url");
    if (!resolved) return null;
    const p = new URLSearchParams({
      url: resolved,
      color: "#e5341c",
      auto_play: "false",
      hide_related: "true",
      show_comments: "false",
      show_user: "true",
      show_reposts: "false",
      visual: opts?.visual ? "true" : "false",
    });
    return `https://w.soundcloud.com/player/?${p.toString()}`;
  } catch {
    return null;
  }
}
