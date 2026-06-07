import type { ReactNode } from "react";
import type { RecordEnvelope, Submission } from "../types";
import { formatDate } from "../format";
import { isSoundCloud, resolveSoundCloudPlayer } from "../soundcloud";

const AUDIO_EXT = /\.(mp3|wav|m4a|ogg|flac|aac)(\?.*)?$/i;
function isAudioFile(url: string): boolean {
  return AUDIO_EXT.test(url);
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

async function SubmissionItem({
  s,
  name,
  plyrEmbed,
}: {
  s: RecordEnvelope<Submission>;
  name?: string;
  /** plyr.fm embed src, when this cover has been re-hosted to plyr. */
  plyrEmbed?: string;
}) {
  const url = s.value.url;

  let player: ReactNode = null;
  let stale = false;

  if (plyrEmbed) {
    player = (
      <iframe
        title="plyr.fm player"
        width="100%"
        height="165"
        frameBorder="0"
        loading="lazy"
        allow="autoplay"
        src={plyrEmbed}
        className="rounded-sharp"
      />
    );
  } else if (url) {
    if (isAudioFile(url)) {
      player = (
        <audio controls preload="none" src={url} className="w-full max-w-md" />
      );
    } else if (isSoundCloud(url)) {
      const src = await resolveSoundCloudPlayer(url);
      if (src) {
        player = (
          <iframe
            title="SoundCloud player"
            width="100%"
            height="120"
            frameBorder="0"
            loading="lazy"
            allow="autoplay"
            src={src}
            className="rounded-sharp"
          />
        );
      } else {
        stale = true;
      }
    }
  }

  return (
    <li className="border-t border-line pt-4">
      {name && <div className="mb-2 text-sm font-medium text-ink">{name}</div>}
      {s.value.note && <p className="mb-2 text-sm text-ink-2">{s.value.note}</p>}

      {player}

      {!player &&
        (url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm text-signal hover:underline"
          >
            {hostOf(url)} →
            {stale && (
              <span className="text-ink-3"> (link may be unavailable)</span>
            )}
          </a>
        ) : (
          <span className="text-sm text-ink-3">(no deliverable)</span>
        ))}

      <div className="mt-1 flex items-center gap-3 text-xs text-ink-3">
        <span>{formatDate(s.value.createdAt)}</span>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {hostOf(url)} ↗
          </a>
        )}
      </div>
    </li>
  );
}

/**
 * The round's submissions, made playable where possible: a resolved SoundCloud
 * player for live links, a native <audio> element for direct files, and a
 * graceful link for stale or unsupported URLs.
 */
export function SubmissionList({
  submissions,
  submitterNames,
  plyrEmbeds,
}: {
  submissions: RecordEnvelope<Submission>[];
  submitterNames?: Record<string, string>;
  /** Submission AT URI → plyr.fm embed src, for covers re-hosted to plyr. */
  plyrEmbeds?: Record<string, string>;
}) {
  if (submissions.length === 0) {
    return <p className="text-sm text-ink-3">No submissions yet.</p>;
  }
  return (
    <ul className="space-y-6">
      {submissions.map((s) => (
        <SubmissionItem
          key={s.uri}
          s={s}
          name={submitterNames?.[s.uri]}
          plyrEmbed={plyrEmbeds?.[s.uri]}
        />
      ))}
    </ul>
  );
}
