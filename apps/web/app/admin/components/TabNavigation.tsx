"use client";

import Link from "next/link";

type TabNavigationProps = {
  activeTab: string;
  currentSlug?: string;
};

export function TabNavigation({ activeTab, currentSlug }: TabNavigationProps) {
  const buildTabUrl = (tab: string) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (currentSlug) {
      params.set('slug', currentSlug);
    }
    return `/admin?${params.toString()}`;
  };

  const tabClass = (tab: string) => {
    const baseClass = "px-4 py-2 rounded-t-lg transition-colors cursor-pointer";
    const isActive = activeTab === tab;
    
    if (tab === "actions") {
      return `${baseClass} ${
        isActive 
          ? "bg-yellow-500 text-black underline decoration-2 underline-offset-4" 
          : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
      }`;
    }
    
    return `${baseClass} ${
      isActive
        ? "bg-background-tertiary/70 text-primary underline decoration-2 underline-offset-4"
        : "text-secondary hover:bg-background-tertiary/30 hover:text-primary"
    }`;
  };

  return (
    <div className="bg-background-secondary/30 border border-background-tertiary/50 rounded-lg p-1 inline-flex gap-1">
      <Link href={buildTabUrl('overview')} className={tabClass('overview')}>
        Overview
      </Link>
      <Link href={buildTabUrl('reports')} className={tabClass('reports')}>
        Rounds
      </Link>
      <Link href={buildTabUrl('users')} className={tabClass('users')}>
        Users
      </Link>
      <Link href={buildTabUrl('feedback')} className={tabClass('feedback')}>
        Feedback
      </Link>
      <Link href={buildTabUrl('actions')} className={tabClass('actions')}>
        Actions
      </Link>
    </div>
  );
}
