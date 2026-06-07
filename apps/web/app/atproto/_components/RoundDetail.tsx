import type { RoundWithSubmissions, EptssSelection } from '@eptss/atproto';
import { deriveState, isSoundCloud, resolveSoundCloudPlayer } from '@eptss/atproto';
import {
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@eptss/ui';
import { StatePill } from './StatePill';
import { Timeline } from './Timeline';
import { SubmissionList } from './SubmissionList';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">
      {children}
    </h2>
  );
}

const cardClass = 'border-gray-800 bg-gray-900/50';

/** Full view of one EPTSS round, read off the network — EPTSS-themed. */
export function RoundDetail({
  data,
  submitterNames,
  plyrEmbeds,
}: {
  data: RoundWithSubmissions;
  submitterNames?: Record<string, string>;
  plyrEmbeds?: Record<string, string>;
}) {
  const { round } = data;
  const state = deriveState(round);
  const song = round.subject;
  const selection = song?.selection;
  const playlistUrl = round.closingEvent?.playlistUrl;

  return (
    <article className="space-y-10">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-100">
            {round.name ?? 'Round'}
          </h1>
          <StatePill state={state} />
        </div>
        {song?.title && (
          <p className="mt-2 text-lg text-gray-300">
            {song.title} <span className="text-gray-500">— {song.artist}</span>
          </p>
        )}
        {round.assignment && (
          <p className="mt-3 max-w-2xl leading-relaxed text-gray-400">
            {round.assignment}
          </p>
        )}
      </header>

      <section>
        <SectionLabel>Timeline</SectionLabel>
        <Card className={cardClass}>
          <CardContent>
            <Timeline round={round} />
          </CardContent>
        </Card>
      </section>

      {selection && hasSelection(selection) && (
        <section>
          <SectionLabel>Song selection</SectionLabel>
          <SelectionView selection={selection} />
        </section>
      )}

      <section>
        <SectionLabel>Submissions ({data.submissions.length})</SectionLabel>
        <Card className={cardClass}>
          <CardContent>
            <SubmissionList
              submissions={data.submissions}
              submitterNames={submitterNames}
              plyrEmbeds={plyrEmbeds}
            />
          </CardContent>
        </Card>
      </section>

      {playlistUrl && (
        <section>
          <SectionLabel>Listening party</SectionLabel>
          <ListeningParty playlistUrl={playlistUrl} />
        </section>
      )}

      <footer className="border-t border-gray-800 pt-4 font-mono text-xs text-gray-600">
        <span className="break-all">{data.uri}</span>
      </footer>
    </article>
  );
}

/**
 * The round's listening-party playlist as an inline player. The set holds the
 * current track references even when individual submission links go stale, so
 * this plays the whole round.
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
          className="mb-2 rounded-lg"
        />
      )}
      <a
        href={playlistUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[var(--color-accent-primary)] hover:underline"
      >
        Open the full playlist on SoundCloud →
      </a>
    </div>
  );
}

function hasSelection(s: EptssSelection): boolean {
  return Boolean(s.signups?.length || s.voteResults?.length);
}

function SubCardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-sm font-medium text-gray-200">{children}</h3>
  );
}

function SelectionView({ selection }: { selection: EptssSelection }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {selection.voteResults && selection.voteResults.length > 0 && (
        <Card className={cardClass}>
          <CardContent>
            <SubCardTitle>Vote results</SubCardTitle>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Song</TableHead>
                  <TableHead className="text-right">Avg</TableHead>
                  <TableHead className="text-right">Votes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selection.voteResults.map((v, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-gray-300">
                      {v.title}{' '}
                      <span className="text-gray-500">— {v.artist}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-gray-200">
                      {v.count ? (v.total / v.count).toFixed(1) : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-gray-500">
                      {v.count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {selection.signups && selection.signups.length > 0 && (
        <Card className={cardClass}>
          <CardContent>
            <SubCardTitle>Songs signed up with</SubCardTitle>
            <ul className="space-y-1 text-sm text-gray-300">
              {selection.signups.map((s, i) => (
                <li key={i}>
                  {s.title} <span className="text-gray-500">— {s.artist}</span>
                  {s.count && s.count > 1 ? (
                    <span className="text-gray-500"> ×{s.count}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
