'use client';

/**
 * Claim / unclaim control for one backfilled cover (Phase B).
 * Calls the server actions in lib/atproto/claim-actions; on success they
 * revalidate /dashboard/profile, so the list re-renders with the new state.
 */
import { Button } from '@eptss/ui';
import {
  claimSubmission,
  unclaimSubmission,
  type ClaimResult,
} from '@/lib/atproto/claim-actions';
import { useServerAction } from './useServerAction';

export function ClaimButton({
  submissionId,
  claimed,
}: {
  submissionId: number;
  claimed: boolean;
}) {
  const { pending, error, run } = useServerAction<ClaimResult>();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        disabled={pending}
        onClick={() =>
          run(() =>
            claimed
              ? unclaimSubmission(submissionId)
              : claimSubmission(submissionId),
          )
        }
        className="h-7 px-3 text-xs"
      >
        {pending ? '…' : claimed ? 'Unclaim' : 'Claim'}
      </Button>
      {error && (
        <span className="max-w-[14rem] text-right text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
