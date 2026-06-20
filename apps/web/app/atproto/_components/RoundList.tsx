import Link from 'next/link';
import type { EptssData } from '@eptss/atproto';
import { deriveState } from '@eptss/atproto';
import { Card, CardContent } from '@eptss/ui';
import { StatePill } from './StatePill';
import { Timeline } from './Timeline';

/** The jam header + every round as a clickable card, with song, state, timeline. */
export function RoundList({ data }: { data: EptssData }) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-100">
          {data.jam?.name ?? 'Everyone Plays the Same Song'}
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-400">
          {data.jam?.description ??
            'Every round, everyone covers the same song. These rounds and their submissions live as records on the AT Protocol network — read here straight off the source.'}
        </p>
        <p className="mt-3 break-all font-mono text-xs text-gray-600">
          {data.did}
        </p>
      </header>

      {data.rounds.length === 0 && (
        <p className="text-gray-500">No rounds published yet.</p>
      )}

      <div className="space-y-4">
        {data.rounds.map((r) => {
          const state = deriveState(r.round);
          const song = r.round.subject;
          return (
            <Link key={r.uri} href={`/atproto/round/${r.rkey}`} className="block">
              <Card className="border-gray-800 bg-gray-900/50 transition-colors hover:border-gray-700 hover:bg-gray-900/80">
                <CardContent>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base font-medium text-gray-100">
                      {r.round.name ?? 'Round'}
                    </span>
                    <StatePill state={state} />
                  </div>
                  {song?.title && (
                    <p className="mt-1 text-sm text-gray-300">
                      {song.title}{' '}
                      <span className="text-gray-500">— {song.artist}</span>
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {r.submissions.length} submission
                    {r.submissions.length === 1 ? '' : 's'}
                  </p>
                  <div className="mt-5">
                    <Timeline round={r.round} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
