'use client';

/**
 * Move / undo control for one cover's plyr.fm track (the in-app plyr re-home).
 * Calls the server actions in lib/atproto/plyr-actions; on success they
 * revalidate /dashboard/profile so the row re-renders in its new state.
 *
 * `state` is computed on the server (plyrOwnership): "eptss" = still on the
 * EPTSS scaffold (offer Move), "mine" = already on the user's repo (offer Undo).
 * Covers with no plyr track render nothing (the page passes null).
 */
import { Button } from '@eptss/ui';
import {
  rehomePlyrTrack,
  undoRehomePlyrTrack,
  type PlyrRehomeResult,
} from '@/lib/atproto/plyr-actions';
import { useServerAction } from './useServerAction';

export function PlyrRehomeButton({
  submissionId,
  state,
}: {
  submissionId: number;
  state: 'eptss' | 'mine';
}) {
  const { pending, error, result, run } = useServerAction<PlyrRehomeResult>();
  const needsRelink = Boolean(result && !result.ok && result.needsRelink);

  return (
    <div className="flex flex-col items-end gap-1">
      {state === 'mine' ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">plyr track on your PDS</span>
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => run(() => undoRehomePlyrTrack(submissionId))}
            className="h-7 px-3 text-xs"
          >
            {pending ? '…' : 'Undo'}
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => run(() => rehomePlyrTrack(submissionId))}
          className="h-7 px-3 text-xs"
        >
          {pending ? 'Moving…' : 'Move plyr track to my PDS'}
        </Button>
      )}
      {error && (
        <span className="max-w-[16rem] text-right text-xs text-red-400">
          {error}
          {needsRelink && (
            <>
              {' '}
              <a href="#atproto-link" className="underline">
                Re-link your Bluesky account ↑
              </a>
            </>
          )}
        </span>
      )}
    </div>
  );
}
