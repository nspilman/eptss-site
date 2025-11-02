'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@eptss/ui';
import type { GroupedVote } from '../types';

interface VotesTabProps {
  votes: GroupedVote[];
}

export function VotesTab({ votes }: VotesTabProps) {
  if (votes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Your Voting Activity</CardTitle>
          <CardDescription className="text-accent-secondary">
            Rounds you&apos;ve participated in voting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-accent-secondary">You haven&apos;t voted in any rounds yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Your Voting Activity</CardTitle>
        <CardDescription className="text-accent-secondary">
          Rounds you&apos;ve participated in voting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {votes.map((voteGroup) => (
            <div key={voteGroup.round_slug} className="p-3 md:p-4 border rounded-lg bg-background-secondary shadow-[0px_0px_2px_2px_var(--color-accent-primary)] transition-all duration-300 hover:shadow-[0px_0px_3px_3px_var(--color-accent-primary)]">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <h3 className="font-medium text-primary">Round #{voteGroup.round_slug}</h3>
                  <p className="text-sm text-accent-secondary">
                    Last voted on {voteGroup.latest_vote_date ? format(new Date(voteGroup.latest_vote_date), 'MMM d, yyyy') : 'Unknown date'}
                  </p>
                  <p className="text-sm text-accent-secondary">
                    <span className="font-medium">{voteGroup.count}</span> song{voteGroup.count !== 1 ? 's' : ''} voted on
                  </p>

                  {/* Vote distribution */}
                  {voteGroup.votes.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-accent-secondary mb-1">Votes breakdown:</p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map(rating => {
                          const count = voteGroup.votes.filter(v => v.vote === rating).length;
                          return count > 0 ? (
                            <Badge key={rating} variant="outline" className="text-xs text-white">
                              {rating}/5: {count}
                            </Badge>
                          ) : null;
                        }).filter(Boolean)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <Link href={`/round/${voteGroup.round_slug}`} className="text-sm text-accent-primary hover:underline">
                  View Round Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
