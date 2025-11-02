'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { tabsListVariants, tabsTriggerVariants } from './primitives/tabs-variants';

export interface NavigationTab {
  href: string;
  label: string;
  exact?: boolean;
}

interface NavigationTabsProps {
  tabs: NavigationTab[];
  className?: string;
  variant?: 'default' | 'outline';
}

export function NavigationTabs({ tabs, className, variant = 'default' }: NavigationTabsProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile dropdown */}
      <div className="md:hidden mb-6">
        <select
          value={pathname || ''}
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
      <div className={cn(tabsListVariants(), "mb-6 hidden md:flex w-full", className)}>
        {tabs.map(tab => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                tabsTriggerVariants({ variant }),
                "flex-1"
              )}
              data-state={active ? "active" : "inactive"}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
