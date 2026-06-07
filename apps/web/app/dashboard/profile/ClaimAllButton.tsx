'use client';

/**
 * "Claim all" — claims every not-yet-claimed cover in one pass (Phase C).
 * Always surfaces a result: a summary + per-cover details on success, the error
 * on failure (a thrown action is caught by the hook, so failures are never silent).
 */
import { Button } from '@eptss/ui';
import { claimAllMine, type ClaimAllResult } from '@/lib/atproto/claim-actions';
import { useServerAction } from './useServerAction';

export function ClaimAllButton({ count }: { count: number }) {
  const { pending, error, result, run } = useServerAction<ClaimAllResult>();

  const summary =
    result?.ok
      ? [
          `${result.claimed} claimed`,
          result.skipped ? `${result.skipped} not on the network yet` : null,
          result.failed ? `${result.failed} failed` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null;
  const details = result?.ok ? result.details ?? [] : [];

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        disabled={pending}
        onClick={() => run(() => claimAllMine())}
        className="h-7 px-3 text-xs"
      >
        {pending ? 'Claiming…' : `Claim all (${count})`}
      </Button>
      {error && (
        <span className="max-w-[18rem] text-right text-xs text-red-400">
          {error}
        </span>
      )}
      {summary && (
        <span className="max-w-[18rem] text-right text-xs text-gray-300">
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
