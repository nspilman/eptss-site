'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Database } from '@/types/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/primitives';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/primitives';
import { Badge } from '@/components/ui/primitives';
import { ExternalLink } from 'lucide-react';
import { Signup, Submission, GroupedVote } from '../types';
import { MissingUserErrorDisplay } from './MissingUserErrorDisplay';
import { ActivityCard } from './ActivityCard';

type User = Database['public']['Tables']['users']['Row'];

interface ProfilePageClientProps {
  user: User | null;
  signups: Signup[];
  submissions: Submission[];
  votes: GroupedVote[];
}

export function ProfilePageClient({ user, signups, submissions, votes }: ProfilePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') || null;
  
  // Set default tab based on URL parameter or default to 'overview'
  const [activeTab, setActiveTab] = useState(
    tabParam === 'signups' || tabParam === 'submissions' || tabParam === 'votes' 
      ? tabParam 
      : 'overview'
  );
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL with the new tab parameter
    if (value === 'overview') {
      // Remove the tab parameter for the overview tab
      router.push('/profile');
    } else {
      router.push(`/profile?tab=${value}`);
    }
  };

  if (!user) {
    return <MissingUserErrorDisplay />;
  }

  // Calculate total signup count across all rounds
  const totalSignupCount = signups.reduce((total, group) => total + group.signup_count, 0);
  
  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'signups', label: `Rounds Signed Up (${signups.length})` },
    { value: 'submissions', label: `Submissions (${submissions.length})` },
    { value: 'votes', label: `Rounds Voted (${votes.length})` },
  ]

  const activityCards = [
    {
      title: 'Your Signups',
      count: signups.length,
      description: `${totalSignupCount} songs across ${signups.length} rounds`,
      linkText: 'View all signups',
      onClick: () => handleTabChange('signups')
    },
    {
      title: 'Your Submissions',
      count: submissions.length,
      description: 'Songs you have submitted',
      linkText: 'View all submissions',
      onClick: () => handleTabChange('submissions')
    },
    {
      title: 'Your Votes',
      count: votes.length,
      description: 'Rounds you have voted in',
      linkText: 'View all votes',
      onClick: () => handleTabChange('votes')
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Your Profile</h1>
        <p className="text-accent-secondary">Welcome back, {user.username || user.email}</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Mobile dropdown for small screens */}
        <div className="md:hidden mb-6">
          <select 
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value)}
            className="w-full p-2 rounded-md bg-background-secondary text-primary border border-accent-secondary/20 focus:outline-none focus:ring-2 focus:ring-accent-primary"
          >
            {tabs.map(tab => (
              <option key={tab.value} value={tab.value}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Traditional tabs for larger screens */}
        <TabsList className="mb-6 bg-background-secondary p-1 rounded-md hidden md:flex w-full">
          {
            tabs.map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
                className="relative text-sm whitespace-nowrap flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-accent-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300 data-[state=active]:after:bg-accent-primary data-[state=active]:after:shadow-[0px_0px_2px_1px_var(--color-accent-primary)] cursor-pointer"
              >
                {tab.label}
              </TabsTrigger>
            ))
          }
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {
              activityCards.map(card => (
                <ActivityCard 
                  key={card.title}
                  title={card.title}
                  count={card.count}
                  description={card.description}
                  linkText={card.linkText}
                  onClick={card.onClick}
                />
              ))
            }
          </div>

          <div className="mt-6 md:mt-8">
            <h2 className="text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {/* Combine and sort activities by date with proper typing */}
              {[
                ...signups.map(item => ({ type: 'signup' as const, data: item, date: item.latest_signup_date })),
                ...submissions.map(item => ({ type: 'submission' as const, data: item, date: item.created_at })),
                ...votes.map(item => ({ type: 'vote' as const, data: item, date: item.latest_vote_date }))
              ]
                .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
                .slice(0, 5)
                .map((activity) => {
                  const date = activity.date ? format(new Date(activity.date), 'MMM d, yyyy') : 'Unknown date';
                  let activityType = '';
                  let description = '';
                  
                  if (activity.type === 'signup') {
                    activityType = 'Signup';
                    description = `You signed up for Round #${activity.data.round_slug}`;
                  } else if (activity.type === 'submission') {
                    activityType = 'Submission';
                    description = `You submitted a song for Round #${activity.data.round_slug}`;
                  } else if (activity.type === 'vote') {
                    activityType = 'Votes';
                    description = `You voted on ${activity.data.count} song${activity.data.count !== 1 ? 's' : ''} in Round #${activity.data.round_slug}`;
                  }
                  
                  return (
                    <div key={`${activityType}-${activity.data.round_slug}`} className="p-3 md:p-4 border rounded-lg bg-background-secondary shadow-[0px_0px_2px_2px_var(--color-accent-secondary)] transition-all duration-300 hover:shadow-[0px_0px_3px_3px_var(--color-accent-secondary)]">
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
          </div>
        </TabsContent>

        <TabsContent value="signups">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Your Signups</CardTitle>
              <CardDescription className="text-accent-secondary">
                Rounds you&apos;ve signed up to participate in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {signups.length === 0 ? (
                <p className="text-accent-secondary">You haven&apos;t signed up for any rounds yet.</p>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Your Submissions</CardTitle>
              <CardDescription className="text-accent-secondary">
                Songs you&apos;ve submitted for rounds
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <p className="text-accent-secondary">You haven&apos;t submitted any songs yet.</p>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="overflow-hidden border rounded-lg bg-background-secondary shadow-[0px_0px_2px_2px_var(--color-accent-secondary)] transition-all duration-300 hover:shadow-[0px_0px_3px_3px_var(--color-accent-secondary)]">
                      {/* Header with round number and date */}
                      <div className="bg-gradient-to-r from-background-tertiary to-background-secondary p-2 md:p-3 border-b border-accent-secondary border-opacity-30 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="flex items-start sm:items-center">
                          <div className="bg-accent-secondary rounded-full w-8 h-8 flex items-center justify-center text-background-primary font-bold mr-2 flex-shrink-0">
                            #{submission.round_slug}
                          </div>
                          <div>
                            <h3 className="font-medium text-primary flex items-center">
                              <span className="mr-1">Round Submission</span>
                              {(submission.title || submission.artist) && (
                                <span className="text-accent-secondary">-</span>
                              )}
                            </h3>
                            <div className="text-xs sm:text-sm">
                              {submission.title && (
                                <span className="font-semibold text-accent-primary">{submission.title}</span>
                              )}
                              {submission.title && submission.artist && (
                                <span className="text-accent-secondary mx-1">by</span>
                              )}
                              {submission.artist && (
                                <span className="text-primary">{submission.artist}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-accent-secondary bg-background-tertiary py-1 px-2 rounded-full self-start sm:self-center">
                          {submission.created_at ? format(new Date(submission.created_at), 'MMM d, yyyy') : 'Unknown date'}
                        </p>
                      </div>
                      
                      {/* Content area */}
                      <div className="p-3 md:p-4">
                        {/* Comments section with parsed JSON */}
                        {submission.additional_comments && (
                          <>
                            {submission.additional_comments.startsWith('{') ? (
                              (() => {
                                try {
                                  const commentsObj = JSON.parse(submission.additional_comments);
                                  // Check if there are any non-empty values
                                  const nonEmptyEntries = Object.entries(commentsObj).filter(
                                    ([_, value]) => value !== "" && value !== null && value !== undefined
                                  );
                                  
                                  // Only render if there are non-empty entries
                                  if (nonEmptyEntries.length === 0) return null;
                                  
                                  return (
                                    <div className="mb-4">
                                      <h4 className="text-sm font-semibold text-accent-primary mb-2">Comments</h4>
                                      <div className="bg-background-tertiary rounded-md p-3 text-sm overflow-hidden">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          {nonEmptyEntries.map(([key, value]) => (
                                             <div key={key} className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 pb-2 border-b border-background-secondary last:border-0">
                                              <span className="font-medium text-accent-primary capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                              </span>
                                              <span className="text-primary">{String(value)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                } catch (e) {
                                  // If it's valid text but not valid JSON, show it
                                  if (submission.additional_comments.trim()) {
                                    return (
                                      <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-accent-primary mb-2">Comments</h4>
                                        <p className="text-sm text-primary bg-background-tertiary rounded-md p-3">
                                          {submission.additional_comments}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }
                              })()
                            ) : (
                              submission.additional_comments.trim() ? (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-accent-primary mb-2">Comments</h4>
                                  <p className="text-sm text-primary bg-background-tertiary rounded-md p-3">
                                    {submission.additional_comments}
                                  </p>
                                </div>
                              ) : null
                            )}
                          </>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-2">
                          <Link 
                            href={`/round/${submission.round_slug}`} 
                            className="text-sm text-primary hover:text-accent-primary transition-colors flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            View Round Details
                          </Link>
                          
                          {submission.soundcloud_url && (
                            <a 
                              href={submission.soundcloud_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center bg-accent-secondary text-background-primary font-medium text-sm py-2 px-4 rounded-md hover:bg-opacity-90 transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                              </svg>
                              Listen on SoundCloud
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="votes">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Your Voting Activity</CardTitle>
              <CardDescription className="text-accent-secondary">
                Rounds you&apos;ve participated in voting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {votes.length === 0 ? (
                <p className="text-accent-secondary">You haven&apos;t voted in any rounds yet.</p>
              ) : (
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
                          
                          {/* Show vote distribution if there are votes */}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
