'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@eptss/ui/lib/utils';

interface ProfileTabsProps {
  signupCount: number;
  submissionCount: number;
  voteCount: number;
}

export function ProfileTabs({ signupCount, submissionCount, voteCount }: ProfileTabsProps) {
  const pathname = usePathname();

  const tabs = [
    { href: '/dashboard/profile', label: 'Overview', exact: true },
    { href: '/dashboard/profile/personal', label: 'Personal Info' },
    { href: '/dashboard/profile/signups', label: `Signups (${signupCount})` },
    { href: '/dashboard/profile/submissions', label: `Submissions (${submissionCount})` },
    { href: '/dashboard/profile/votes', label: `Votes (${voteCount})` },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile dropdown */}
      <div className="md:hidden mb-6">
        <select
          value={pathname}
          onChange={(e) => window.location.href = e.target.value}
          className="w-full p-2 rounded-md bg-background-secondary text-primary border border-accent-secondary/20 focus:outline-none focus:ring-2 focus:ring-accent-primary"
        >
          {tabs.map(tab => (
            <option key={tab.href} value={tab.href}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop tabs */}
      <div className="mb-6 bg-background-secondary p-1 rounded-md hidden md:flex w-full">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative text-sm whitespace-nowrap flex-1 px-3 py-2 text-center transition-colors",
              "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]",
              "after:transition-transform after:duration-300",
              isActive(tab.href, tab.exact)
                ? "text-accent-primary after:scale-x-100 after:bg-accent-primary after:shadow-[0px_0px_2px_1px_var(--color-accent-primary)]"
                : "text-primary hover:text-accent-primary/70 after:scale-x-0"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </>
  );
}
