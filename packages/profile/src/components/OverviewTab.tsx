'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@eptss/ui';
import type { GroupedSignup, Submission, GroupedVote } from '../types';
import { ActivityCard } from './ActivityCard';

interface OverviewTabProps {
  signups: GroupedSignup[];
  submissions: Submission[];
  votes: GroupedVote[];
}

export function OverviewTab({ signups, submissions, votes }: OverviewTabProps) {
  const totalSignupCount = signups.reduce((total, group) => total + group.signup_count, 0);

  const activityCards = [
    {
      title: 'Your Signups',
      count: signups.length,
      description: `${totalSignupCount} songs across ${signups.length} rounds`,
      linkText: 'View all signups',
      href: '/dashboard/profile/signups'
    },
    {
      title: 'Your Submissions',
      count: submissions.length,
      description: 'Songs you have submitted',
      linkText: 'View all submissions',
      href: '/dashboard/profile/submissions'
    },
    {
      title: 'Your Votes',
      count: votes.length,
      description: 'Rounds you have voted in',
      linkText: 'View all votes',
      href: '/dashboard/profile/votes'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Activity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {activityCards.map(card => (
          <Link key={card.title} href={card.href}>
            <ActivityCard
              title={card.title}
              count={card.count}
              description={card.description}
              linkText={card.linkText}
              onClick={() => {}}
            />
          </Link>
        ))}
      </div>

      {/* Recent Activity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Recent Activity</CardTitle>
          <CardDescription className="text-accent-secondary">
            Your latest actions across all rounds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              ...signups.map(item => ({ type: 'signup' as const, data: item, date: item.latest_signup_date })),
              ...submissions.map(item => ({ type: 'submission' as const, data: item, date: item.created_at })),
              ...votes.map(item => ({ type: 'vote' as const, data: item, date: item.latest_vote_date }))
            ]
              .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
              .slice(0, 5)
              .map((activity, index) => {
                const date = activity.date ? format(new Date(activity.date), 'MMM d, yyyy') : 'Unknown date';
                let activityType = '';
                let description = '';
                let uniqueKey = '';

                if (activity.type === 'signup') {
                  activityType = 'Signup';
                  description = `You signed up for Round #${activity.data.round_slug}`;
                  uniqueKey = `signup-${activity.data.round_id}-${index}`;
                } else if (activity.type === 'submission') {
                  activityType = 'Submission';
                  description = `You submitted a song for Round #${activity.data.round_slug}`;
                  uniqueKey = `submission-${activity.data.id}-${index}`;
                } else if (activity.type === 'vote') {
                  activityType = 'Votes';
                  description = `You voted on ${activity.data.count} song${activity.data.count !== 1 ? 's' : ''} in Round #${activity.data.round_slug}`;
                  uniqueKey = `vote-${activity.data.round_slug}-${index}`;
                }

                return (
                  <div key={uniqueKey} className="p-3 md:p-4 border rounded-lg bg-background-secondary shadow-[0px_0px_2px_2px_var(--color-accent-secondary)] transition-all duration-300 hover:shadow-[0px_0px_3px_3px_var(--color-accent-secondary)]">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <Badge className="mb-2">{activityType}</Badge>
                        <p className="text-primary">{description}</p>
                      </div>
                      <span className="text-xs sm:text-sm text-accent-secondary">{date}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
