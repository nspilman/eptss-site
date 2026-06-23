'use client';

/**
 * Claim control for one backfilled cover — brings it into the signed-in user's repo.
 * Calls claimSubmission; on success it revalidates /dashboard/profile so the list
 * re-renders. A claimed cover shows a quiet status, not an action: unclaiming is a
 * teardown concern (the reset script), never something an end user reaches for.
 */
import { Button } from '@eptss/ui';
import { claimSubmission, type ClaimResult } from '@/lib/atproto/claim-actions';
import { useServerAction } from './useServerAction';

export function ClaimButton({
  submissionId,
  claimed,
}: {
  submissionId: number;
  claimed: boolean;
}) {
  const { pending, error, run } = useServerAction<ClaimResult>();

  // Already in the user's repo — confirm it, but offer no way to undo it.
  if (claimed) {
    return <span className="text-xs text-green-400">Claimed ✓</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        disabled={pending}
        onClick={() => run(() => claimSubmission(submissionId))}
        className="h-7 px-3 text-xs"
      >
        {pending ? '…' : 'Claim'}
      </Button>
      {error && (
        <span className="max-w-[14rem] text-right text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
