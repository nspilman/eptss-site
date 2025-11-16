'use client';

import { NavigationTabs } from '@eptss/ui';

interface ProfileTabsProps {
  signupCount: number;
  submissionCount: number;
  voteCount: number;
  referralCount?: number;
}

export function ProfileTabs({ signupCount, submissionCount, voteCount, referralCount = 0 }: ProfileTabsProps) {
  const tabs = [
    { href: '/dashboard/profile', label: 'Personal Info', exact: true },
    { href: '/dashboard/profile/signups', label: `Signups (${signupCount})` },
    { href: '/dashboard/profile/submissions', label: `Submissions (${submissionCount})` },
    { href: '/dashboard/profile/votes', label: `Votes (${voteCount})` },
    { href: '/dashboard/profile/referrals', label: `Referrals (${referralCount})` },
  ];

  return <NavigationTabs tabs={tabs} />;
}
