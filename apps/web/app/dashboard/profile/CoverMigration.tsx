'use client';

/**
 * The link→migrate bridge. Linking an Atmosphere account is only half the promise;
 * the other half is that the covers EPTSS holds on your behalf actually move into
 * *your* repo. This makes that one continuous moment: when you return from OAuth
 * (`?linked=success`), this card auto-runs and you watch each cover land.
 *
 * Why the client drives the loop (instead of one atomic batch action on the server):
 * progress is the point. Each `migrateOneCover` await is exactly one record landing
 * in your PDS, so the bar advances on real events, not a guess. The per-record path
 * is already verified + idempotent (read-back before the pointer is set), so a
 * partial run is safe to re-run — the "Retry" below just re-attempts what's left.
 *
 * Sequential, not parallel: every cover writes to the same repo, and concurrent
 * commits to one repo race. One at a time is both correct and the better story to
 * watch. When the run settles we `router.refresh()` once, flipping the durable
 * "Your covers" list to its claimed state.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@eptss/ui';
import { migrateOneCover } from '@/lib/atproto/claim-actions';

export interface MigratableCover {
  submissionId: number;
  songTitle: string | null;
  songArtist: string | null;
}

type Status = 'pending' | 'migrating' | 'done' | 'skipped' | 'failed';
type Phase = 'idle' | 'running' | 'done';

/** Each status, described once: how it looks and the word it leaves in the margin. */
const STATUS: Record<
  Status,
  { color: string; glyph?: string; spin?: boolean; note?: string }
> = {
  pending: { color: 'text-gray-600', glyph: '○' },
  migrating: { color: 'text-[var(--color-accent-primary)]', spin: true },
  done: { color: 'text-green-400', glyph: '✓' },
  skipped: { color: 'text-amber-400', glyph: '⤳', note: 'not on the network yet' },
  failed: { color: 'text-red-400', glyph: '✗', note: 'failed' },
};

const isSettled = (s: Status) => s === 'done' || s === 'skipped' || s === 'failed';
const plural = (n: number) => (n === 1 ? '' : 's');

interface CoverMigrationProps {
  /** The covers still held on the admin scaffold (claimed_at_uri IS NULL). */
  covers: MigratableCover[];
  /** The linked handle, for the "into @you" framing. */
  handle: string | null;
  /** True on the post-OAuth landing (?linked=success) — begin migrating at once. */
  autoStart: boolean;
}

export function CoverMigration({ covers, handle, autoStart }: CoverMigrationProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [statuses, setStatuses] = useState<Record<number, Status>>(() =>
    Object.fromEntries(covers.map((c) => [c.submissionId, 'pending' as Status])),
  );
  // Guards the auto-start effect against React's double-invoke in dev/StrictMode.
  const startedRef = useRef(false);

  const statusOf = useCallback(
    (id: number): Status => statuses[id] ?? 'pending',
    [statuses],
  );

  const setStatus = useCallback((id: number, s: Status) => {
    setStatuses((prev) => ({ ...prev, [id]: s }));
  }, []);

  // One walk of the list, one tally — every count the UI needs.
  const total = covers.length;
  const count = covers.reduce(
    (acc, c) => {
      const s = statusOf(c.submissionId);
      if (isSettled(s)) acc.settled++;
      if (s === 'done') acc.done++;
      else if (s === 'skipped') acc.skipped++;
      else if (s === 'failed') acc.failed++;
      return acc;
    },
    { settled: 0, done: 0, skipped: 0, failed: 0 },
  );
  const pct = total === 0 ? 0 : Math.round((count.settled / total) * 100);

  /** Walk the given covers one at a time, reflecting each result as it lands. */
  const migrate = useCallback(
    async (todo: MigratableCover[]) => {
      if (todo.length === 0) return;
      setPhase('running');
      for (const c of todo) {
        setStatus(c.submissionId, 'migrating');
        try {
          const res = await migrateOneCover(c.submissionId);
          setStatus(
            c.submissionId,
            res.ok ? 'done' : res.skipped ? 'skipped' : 'failed',
          );
        } catch {
          setStatus(c.submissionId, 'failed');
        }
      }
      setPhase('done');
      // Settle the durable "Your covers" list to its claimed state in one pass.
      router.refresh();
    },
    [router, setStatus],
  );

  // Linking is the consent; on return from OAuth we begin without a second click.
  useEffect(() => {
    if (autoStart && !startedRef.current && covers.length > 0) {
      startedRef.current = true;
      void migrate(covers);
    }
  }, [autoStart, covers, migrate]);

  const retryFailed = () =>
    void migrate(covers.filter((c) => statusOf(c.submissionId) === 'failed'));

  // Each phase says one plain sentence. `home` is the "(@you)" the eye returns to.
  const home = handle ? ` (@${handle})` : '';
  const description =
    phase === 'idle'
      ? `${total} cover${plural(total)} from your EPTSS history can move into your repo${home}, owned by you. (They stay safe with EPTSS either way.)`
      : phase === 'running'
        ? `Moving ${total} cover${plural(total)} into your repo${home}…`
        : count.failed > 0
          ? `${count.done} cover${plural(count.done)} moved into your repo. ${count.failed} didn't make it — retry below.`
          : count.skipped > 0
            ? `${count.done} now live in your repo${home}. ${count.skipped} aren't on the network yet — they'll be claimable once backfilled.`
            : `All ${count.done} cover${plural(count.done)} are now in your repo${home}. 🎉`;

  return (
    <Card className="border-gray-800 bg-gray-900/50">
      <CardHeader>
        <CardTitle>Bring your covers home</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {phase === 'idle' ? (
          <Button onClick={() => void migrate(covers)}>
            Bring {total} cover{plural(total)} home
          </Button>
        ) : (
          <>
            {/* Progress bar — advances on real record-landed events. */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {count.settled} of {total}
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-[var(--color-accent-primary)] transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Per-cover live status. */}
            <ul className="space-y-1.5">
              {covers.map((c) => {
                const s = statusOf(c.submissionId);
                const st = STATUS[s];
                return (
                  <li
                    key={c.submissionId}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <span className={`inline-flex w-4 shrink-0 justify-center ${st.color}`}>
                      {st.spin ? (
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-700 border-t-[var(--color-accent-primary)]" />
                      ) : (
                        st.glyph
                      )}
                    </span>
                    <span
                      className={`min-w-0 truncate ${s === 'pending' ? 'text-gray-500' : 'text-gray-200'}`}
                    >
                      {c.songTitle ?? 'Unknown song'}
                      {c.songArtist && (
                        <span className="text-gray-500"> — {c.songArtist}</span>
                      )}
                    </span>
                    {st.note && (
                      <span className={`ml-auto shrink-0 text-xs ${st.color}`}>
                        {st.note}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            {phase === 'done' && count.failed > 0 && (
              <Button variant="outline" onClick={retryFailed}>
                Retry {count.failed} failed
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
