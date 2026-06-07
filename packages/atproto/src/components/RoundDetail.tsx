import type { RoundWithSubmissions } from "../read";
import type { EptssSelection } from "../types";
import { deriveState } from "../state";
import { isSoundCloud, resolveSoundCloudPlayer } from "../soundcloud";
import { StatePill } from "./StatePill";
import { TransitLine } from "./TransitLine";
import { SubmissionList } from "./SubmissionList";

/** Full view of one EPTSS round, read off the network. */
export function RoundDetail({
  data,
  submitterNames,
  plyrEmbeds,
}: {
  data: RoundWithSubmissions;
  /** Submission AT URI → submitter display name (resolved from the EPTSS DB). */
  submitterNames?: Record<string, string>;
  /** Submission AT URI → plyr.fm embed src, for covers re-hosted to plyr. */
  plyrEmbeds?: Record<string, string>;
}) {
  const { round } = data;
  const state = deriveState(round);
  const song = round.subject;
  const selection = song?.selection;
  const playlistUrl = round.closingEvent?.playlistUrl;

  return (
    <article>
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {round.name ?? "Round"}
          </h1>
          <StatePill state={state} />
        </div>
        {song?.title && (
          <p className="mt-2 text-lg text-ink-2">
            {song.title} <span className="text-ink-3">— {song.artist}</span>
          </p>
        )}
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">
          {round.assignment}
        </p>
      </header>

      <section className="mt-10">
        <h2 className="mb-5 text-label uppercase text-ink-3">Timeline</h2>
        <TransitLine round={round} />
      </section>

      {selection && hasSelection(selection) && (
        <section className="mt-12">
          <h2 className="mb-4 text-label uppercase text-ink-3">
            Song selection
          </h2>
          <SelectionView selection={selection} />
        </section>
      )}

      <section className="mt-12">
        <h2 className="mb-4 text-label uppercase text-ink-3">
          Submissions ({data.submissions.length})
        </h2>
        <SubmissionList
          submissions={data.submissions}
          submitterNames={submitterNames}
          plyrEmbeds={plyrEmbeds}
        />
      </section>

      {playlistUrl && (
        <section className="mt-12">
          <h2 className="mb-3 text-label uppercase text-ink-3">
            Listening party
          </h2>
          <ListeningParty playlistUrl={playlistUrl} />
        </section>
      )}

      <footer className="mt-12 border-t border-line pt-4 font-mono text-xs text-ink-3">
        <span className="break-all">{data.uri}</span>
      </footer>
    </article>
  );
}

/**
 * The round's listening-party playlist as an inline player. The set is the
 * reliable source — it holds the current track references even when individual
 * submission links have gone stale — so this plays the whole round.
 */
async function ListeningParty({ playlistUrl }: { playlistUrl: string }) {
  const src = isSoundCloud(playlistUrl)
    ? await resolveSoundCloudPlayer(playlistUrl, { visual: true })
    : null;
  return (
    <div>
      {src && (
        <iframe
          title="Listening party playlist"
          width="100%"
          height="380"
          frameBorder="0"
          loading="lazy"
          allow="autoplay"
          src={src}
          className="mb-2 rounded-sharp"
        />
      )}
      <a
        href={playlistUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-signal hover:underline"
      >
        Open the full playlist on SoundCloud →
      </a>
    </div>
  );
}

function hasSelection(s: EptssSelection): boolean {
  return Boolean(s.signups?.length || s.voteResults?.length);
}

function SelectionView({ selection }: { selection: EptssSelection }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {selection.voteResults && selection.voteResults.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-medium text-ink-2">Vote results</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-label uppercase text-ink-3">
                <th className="py-1 pr-3 font-medium">Song</th>
                <th className="py-1 pr-3 text-right font-medium">Avg</th>
                <th className="py-1 text-right font-medium">Votes</th>
              </tr>
            </thead>
            <tbody>
              {selection.voteResults.map((v, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="py-1.5 pr-3 text-ink-2">
                    {v.title}{" "}
                    <span className="text-ink-3">— {v.artist}</span>
                  </td>
                  <td className="py-1.5 pr-3 text-right tabular-nums text-ink">
                    {v.count ? (v.total / v.count).toFixed(1) : "—"}
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-ink-3">
                    {v.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selection.signups && selection.signups.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-medium text-ink-2">
            Songs signed up with
          </h3>
          <ul className="space-y-1 text-sm text-ink-2">
            {selection.signups.map((s, i) => (
              <li key={i}>
                {s.title} <span className="text-ink-3">— {s.artist}</span>
                {s.count && s.count > 1 ? (
                  <span className="text-ink-3"> ×{s.count}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
