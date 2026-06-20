'use client';

/**
 * One shape for "click → run a server action → reflect pending / error / result."
 * The claim and plyr buttons all hand-rolled the same transition + caught error +
 * try/catch; this is that pattern with a single center.
 *
 * The server actions here return `{ ok, error? }`, so a non-ok result surfaces as
 * `error`, and a thrown action is caught too — nothing fails silently. The full
 * `result` is handed back for callers that render more than yes/no (e.g. the
 * claim-all summary, or a needs-relink hint).
 */
import { useState, useTransition } from 'react';

export interface ServerActionHandle<T> {
  pending: boolean;
  error: string | null;
  result: T | null;
  run: (action: () => Promise<T>) => void;
}

export function useServerAction<
  T extends { ok: boolean; error?: string },
>(): ServerActionHandle<T> {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);

  function run(action: () => Promise<T>) {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const res = await action();
        setResult(res);
        if (!res.ok) setError(res.error ?? 'Something went wrong.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'request failed');
      }
    });
  }

  return { pending, error, result, run };
}
