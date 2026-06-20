import type { ReactNode } from 'react';
import type { RecordEnvelope, Submission } from '@eptss/atproto';
import { formatDate, isSoundCloud, resolveSoundCloudPlayer } from '@eptss/atproto';

const AUDIO_EXT = /\.(mp3|wav|m4a|ogg|flac|aac)(\?.*)?$/i;
const isAudioFile = (url: string) => AUDIO_EXT.test(url);

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
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
        className="rounded-lg"
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
            className="rounded-lg"
          />
        );
      } else {
        stale = true;
      }
    }
  }

  return (
    <li className="border-t border-gray-800 pt-4 first:border-t-0 first:pt-0">
      {name && (
        <div className="mb-2 text-sm font-medium text-gray-100">{name}</div>
      )}
      {s.value.note && <p className="mb-2 text-sm text-gray-400">{s.value.note}</p>}

      {player}

      {!player &&
        (url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm text-[var(--color-accent-primary)] hover:underline"
          >
            {hostOf(url)} →
            {stale && (
              <span className="text-gray-500"> (link may be unavailable)</span>
            )}
          </a>
        ) : (
          <span className="text-sm text-gray-500">(no deliverable)</span>
        ))}

      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
        <span>{formatDate(s.value.createdAt)}</span>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 hover:underline"
          >
            {hostOf(url)} ↗
          </a>
        )}
      </div>
    </li>
  );
}

/**
 * The round's submissions, made playable where possible: the plyr.fm player for
 * re-hosted covers, a resolved SoundCloud player for live links, a native
 * <audio> element for direct files, and a graceful link for stale URLs.
 */
export function SubmissionList({
  submissions,
  submitterNames,
  plyrEmbeds,
}: {
  submissions: RecordEnvelope<Submission>[];
  submitterNames?: Record<string, string>;
  plyrEmbeds?: Record<string, string>;
}) {
  if (submissions.length === 0) {
    return <p className="text-sm text-gray-500">No submissions yet.</p>;
  }
  return (
    <ul className="space-y-5">
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
