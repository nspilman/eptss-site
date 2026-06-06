'use client';

/**
 * "Claim all" — claims every not-yet-claimed cover in one pass (Phase C).
 * Always surfaces a result (summary + per-cover details), and catches a thrown
 * action so failures can never be silent. Also logs to the browser console.
 */
import { useState, useTransition } from 'react';
import { Button } from '@eptss/ui';
import { claimAllMine } from '@/lib/atproto/claim-actions';

export function ClaimAllButton({ count }: { count: number }) {
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        disabled={pending}
        onClick={() => {
          setSummary(null);
          setDetails([]);
          setIsError(false);
          startTransition(async () => {
            try {
              const r = await claimAllMine();
              console.log('[claim] claimAllMine result', r);
              if (!r.ok) {
                setIsError(true);
                setSummary(r.error ?? 'Something went wrong.');
                return;
              }
              const parts = [`${r.claimed} claimed`];
              if (r.skipped) parts.push(`${r.skipped} not on the network yet`);
              if (r.failed) parts.push(`${r.failed} failed`);
              setSummary(parts.join(' · '));
              setDetails(r.details ?? []);
            } catch (err) {
              console.error('[claim] claimAllMine threw', err);
              setIsError(true);
              setSummary(
                `Error: ${err instanceof Error ? err.message : 'request failed'}`,
              );
            }
          });
        }}
        className="h-7 px-3 text-xs"
      >
        {pending ? 'Claiming…' : `Claim all (${count})`}
      </Button>
      {summary && (
        <span
          className={`max-w-[18rem] text-right text-xs ${
            isError ? 'text-red-400' : 'text-gray-300'
          }`}
        >
          {summary}
        </span>
      )}
      {details.length > 0 && (
        <ul className="max-w-[18rem] text-right text-[11px] text-gray-500">
          {details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
