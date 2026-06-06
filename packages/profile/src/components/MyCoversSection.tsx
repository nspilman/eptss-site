/**
 * "Your covers" — the claim-flow surface on the profile page.
 *
 * Shows a linked user the covers EPTSS holds on their behalf and lets them claim
 * each one into their own repo. Presentational only: the page fetches the data
 * (see apps/web/lib/atproto/claims.ts) and passes both the covers and a
 * `renderClaimAction` slot, so this package stays free of DB/network/server-action
 * concerns — the actual claim button is an app-level client component.
 */
import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@eptss/ui';
import { formatDate } from '@eptss/core/utils/formatDate';

export interface CoverItem {
  submissionId: number;
  roundSlug: string | null;
  songTitle: string | null;
  songArtist: string | null;
  deliverableUrl: string | null;
  createdAt: string | Date | null;
  /** Non-null once claimed into the user's repo. */
  claimedAtUri: string | null;
}

interface MyCoversSectionProps {
  covers: CoverItem[];
  /** The linked Bluesky handle, for the "claim to @you" framing. */
  handle: string | null;
  /** App-supplied claim/unclaim control for a cover (kept out of this package). */
  renderClaimAction?: (cover: CoverItem) => ReactNode;
}

export function MyCoversSection({
  covers,
  handle,
  renderClaimAction,
}: MyCoversSectionProps) {
  const count = covers.length;
  const plural = count === 1 ? '' : 's';
  const them = count === 1 ? 'it' : 'them';

  return (
    <Card className="border-gray-800 bg-gray-900/50">
      <CardHeader>
        <CardTitle>Your covers</CardTitle>
        <CardDescription>
          {count === 0
            ? "We don't have any covers on file for you yet."
            : `${count} cover${plural} from your EPTSS history. Claim ${them} to ` +
              `move ${them} into your own Bluesky account${handle ? ` (@${handle})` : ''} ` +
              `— so ${them} live in your repo, owned by you. (Your covers stay safe ` +
              `with EPTSS either way.)`}
        </CardDescription>
      </CardHeader>

      {count > 0 && (
        <CardContent className="space-y-3">
          {covers.map((c) => {
            const meta = [
              c.roundSlug ? `Round ${c.roundSlug}` : null,
              c.createdAt ? formatDate(c.createdAt) : null,
            ]
              .filter(Boolean)
              .join(' · ');

            return (
              <div
                key={c.submissionId}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-gray-800 pt-3 first:border-t-0 first:pt-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-100">
                    {c.songTitle ?? 'Unknown song'}
                    {c.songArtist && (
                      <span className="text-gray-500"> — {c.songArtist}</span>
                    )}
                  </div>
                  {(meta || c.deliverableUrl) && (
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                      {meta && <span>{meta}</span>}
                      {c.deliverableUrl && (
                        <a
                          href={c.deliverableUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-accent-primary)] hover:underline"
                        >
                          listen ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {c.claimedAtUri ? (
                    <Badge variant="secondary" className="text-xs">
                      Claimed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Held by EPTSS
                    </Badge>
                  )}
                  {renderClaimAction?.(c)}
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
