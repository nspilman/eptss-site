'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@eptss/ui';
import { ExternalLink } from 'lucide-react';
import type { GroupedSignup } from '../types';

interface SignupsTabProps {
  signups: GroupedSignup[];
}

export function SignupsTab({ signups }: SignupsTabProps) {
  if (signups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Your Signups</CardTitle>
          <CardDescription className="text-accent-secondary">
            Rounds you&apos;ve signed up to participate in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-accent-secondary">You haven&apos;t signed up for any rounds yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Your Signups</CardTitle>
        <CardDescription className="text-accent-secondary">
          Rounds you&apos;ve signed up to participate in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {signups.map((roundSignup) => (
            <div key={roundSignup.round_slug} className="p-3 md:p-4 border rounded-lg bg-background-secondary shadow-[0px_0px_2px_2px_var(--color-accent-primary)] transition-all duration-300 hover:shadow-[0px_0px_3px_3px_var(--color-accent-primary)]">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <h3 className="font-medium text-primary">Round #{roundSignup.round_id}</h3>
                  <div className="flex items-center gap-2 mt-1 text-wrap">
                    <p className="text-xs text-accent-secondary">
                      Latest signup: {roundSignup.latest_signup_date ? format(new Date(roundSignup.latest_signup_date), 'MMM d, yyyy') : 'Unknown date'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/round/${roundSignup.round_slug}`}
                  className="flex items-center text-xs sm:text-sm text-accent-primary hover:underline mt-1 sm:mt-0"
                >
                  View Round <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </div>

              {roundSignup.signups.length > 0 && (
                <div className="mt-2">
                  <div className="space-y-3">
                    {roundSignup.signups.map((signup) => (
                      <div key={signup.id} className="p-2 md:p-3 bg-background-tertiary rounded-md">
                        <div className="mb-2">
                          <h5 className="font-medium text-accent-primary">{signup.title} by {signup.artist}</h5>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <p className="text-xs text-accent-secondary">
                              Signed up on {signup.created_at ? format(new Date(signup.created_at), 'MMM d, yyyy') : 'Unknown date'}
                            </p>
                            {signup.additional_comments && (
                              <p className="text-xs text-accent-secondary mt-1">
                                <span className="font-medium">Comments:</span> {signup.additional_comments}
                              </p>
                            )}
                          </div>
                          {signup.youtube_link && (
                            <a
                              href={signup.youtube_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-xs text-accent-primary hover:underline mt-1 sm:mt-0"
                            >
                              View YouTube <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
