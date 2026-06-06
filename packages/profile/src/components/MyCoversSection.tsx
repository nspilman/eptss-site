/**
 * "Your covers" — Phase A of the claim flow.
 *
 * A read-only preview, shown to a linked user, of the covers EPTSS holds on
 * their behalf: the submissions that currently live on the EPTSS admin account
 * and will become claimable into the user's own repo as the flow rolls out.
 * Nothing here writes or moves anything — it just makes ownership legible.
 *
 * Presentational only: the page fetches the data (see apps/web/lib/atproto/claims.ts)
 * and passes it in, so this package stays free of DB/network concerns.
 */
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
}

interface MyCoversSectionProps {
  covers: CoverItem[];
  /** The linked Bluesky handle, for the "claimable to @you" framing. */
  handle: string | null;
}

export function MyCoversSection({ covers, handle }: MyCoversSectionProps) {
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
            : `${count} cover${plural} from your EPTSS history. We're moving EPTSS ` +
              `onto the AT Protocol; as claiming rolls out you'll be able to claim ` +
              `${them} to your own Bluesky account${handle ? ` (@${handle})` : ''}, ` +
              `so ${them} live in your repo — owned by you.`}
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
                <Badge variant="outline" className="shrink-0 text-xs">
                  Held by EPTSS
                </Badge>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
