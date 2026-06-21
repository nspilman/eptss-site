'use client';

/**
 * The link→migrate bridge. Linking an Atmosphere account is only half the promise;
 * the other half is that the records EPTSS holds for you actually move into *your*
 * repo. This makes that one continuous moment: when you return from OAuth
 * (`?linked=success`), this card auto-runs and you watch each record land.
 *
 * It brings home two kinds of record — your COVERS (`at.atjam.submission`) and your
 * SIGNUPS (`at.atjam.signup`) — dispatching each item to its own migrate action.
 * Signups are song-free by construction (the nominated song stays in Postgres); a
 * signup row shows only its round.
 *
 * Why the client drives the loop (instead of one atomic batch action on the
 * server): progress is the point. Each await is exactly one record landing in your
 * PDS, so the bar advances on real events, not a guess. Each per-record path is
 * verified + idempotent (read-back before the pointer is set), so a partial run is
 * safe to re-run — the "Retry" below just re-attempts what's left.
 *
 * Sequential, not parallel: every record writes to the same repo, and concurrent
 * commits to one repo race. One at a time is both correct and the better story to
 * watch. When the run settles we `router.refresh()` once.
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
import { migrateOneSignup } from '@/lib/atproto/signup-actions';

export type MigratableItem =
  | { kind: 'cover'; id: number; title: string; subtitle: string | null }
  | { kind: 'signup'; id: number; title: string; subtitle: string | null };

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
const keyOf = (it: MigratableItem) => `${it.kind}-${it.id}`;

interface RecordMigrationProps {
  /** The records still held in Postgres (claimed_at_uri IS NULL), covers + signups. */
  items: MigratableItem[];
  /** The linked handle, for the "into @you" framing. */
  handle: string | null;
  /** True on the post-OAuth landing (?linked=success) — begin migrating at once. */
  autoStart: boolean;
}

export function RecordMigration({ items, handle, autoStart }: RecordMigrationProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [statuses, setStatuses] = useState<Record<string, Status>>(() =>
    Object.fromEntries(items.map((it) => [keyOf(it), 'pending' as Status])),
  );
  // Guards the auto-start effect against React's double-invoke in dev/StrictMode.
  const startedRef = useRef(false);

  const statusOf = useCallback(
    (key: string): Status => statuses[key] ?? 'pending',
    [statuses],
  );

  const setStatus = useCallback((key: string, s: Status) => {
    setStatuses((prev) => ({ ...prev, [key]: s }));
  }, []);

  // One walk of the list, one tally — every count the UI needs.
  const total = items.length;
  const coverCount = items.filter((it) => it.kind === 'cover').length;
  const signupCount = total - coverCount;
  const count = items.reduce(
    (acc, it) => {
      const s = statusOf(keyOf(it));
      if (isSettled(s)) acc.settled++;
      if (s === 'done') acc.done++;
      else if (s === 'skipped') acc.skipped++;
      else if (s === 'failed') acc.failed++;
      return acc;
    },
    { settled: 0, done: 0, skipped: 0, failed: 0 },
  );
  const pct = total === 0 ? 0 : Math.round((count.settled / total) * 100);

  /** Walk the given records one at a time, reflecting each result as it lands. */
  const migrate = useCallback(
    async (todo: MigratableItem[]) => {
      if (todo.length === 0) return;
      setPhase('running');
      for (const it of todo) {
        setStatus(keyOf(it), 'migrating');
        try {
          const res =
            it.kind === 'cover'
              ? await migrateOneCover(it.id)
              : await migrateOneSignup(it.id);
          setStatus(
            keyOf(it),
            res.ok ? 'done' : res.skipped ? 'skipped' : 'failed',
          );
        } catch {
          setStatus(keyOf(it), 'failed');
        }
      }
      setPhase('done');
      // Settle the durable views to their migrated state in one pass.
      router.refresh();
    },
    [router, setStatus],
  );

  // Linking is the consent; on return from OAuth we begin without a second click.
  useEffect(() => {
    if (autoStart && !startedRef.current && items.length > 0) {
      startedRef.current = true;
      void migrate(items);
    }
  }, [autoStart, items, migrate]);

  const retryFailed = () =>
    void migrate(items.filter((it) => statusOf(keyOf(it)) === 'failed'));

  // Each phase says one plain sentence. `home` is the "(@you)" the eye returns to.
  const home = handle ? ` (@${handle})` : '';
  const mix =
    coverCount > 0 && signupCount > 0
      ? `${coverCount} cover${plural(coverCount)} + ${signupCount} signup${plural(signupCount)}`
      : coverCount > 0
        ? `${coverCount} cover${plural(coverCount)}`
        : `${signupCount} signup${plural(signupCount)}`;
  const description =
    phase === 'idle'
      ? `${mix} from your EPTSS history can move into your repo${home}, owned by you. (Your data stays safe with EPTSS either way.)`
      : phase === 'running'
        ? `Moving ${mix} into your repo${home}…`
        : count.failed > 0
          ? `${count.done} record${plural(count.done)} moved into your repo. ${count.failed} didn't make it — retry below.`
          : count.skipped > 0
            ? `${count.done} now live in your repo${home}. ${count.skipped} aren't on the network yet.`
            : `All ${count.done} record${plural(count.done)} are now in your repo${home}. 🎉`;

  return (
    <Card className="mb-6 border-gray-800 bg-gray-900/50">
      <CardHeader>
        <CardTitle>Bring your records home</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {phase === 'idle' ? (
          <Button onClick={() => void migrate(items)}>
            Bring {total} record{plural(total)} home
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

            {/* Per-record live status. */}
            <ul className="space-y-1.5">
              {items.map((it) => {
                const s = statusOf(keyOf(it));
                const st = STATUS[s];
                return (
                  <li key={keyOf(it)} className="flex items-center gap-2.5 text-sm">
                    <span className={`inline-flex w-4 shrink-0 justify-center ${st.color}`}>
                      {st.spin ? (
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-700 border-t-[var(--color-accent-primary)]" />
                      ) : (
                        st.glyph
                      )}
                    </span>
                    <span className="shrink-0 rounded bg-gray-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                      {it.kind}
                    </span>
                    <span
                      className={`min-w-0 truncate ${s === 'pending' ? 'text-gray-500' : 'text-gray-200'}`}
                    >
                      {it.title}
                      {it.subtitle && (
                        <span className="text-gray-500"> — {it.subtitle}</span>
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
