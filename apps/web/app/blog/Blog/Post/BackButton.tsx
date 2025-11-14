"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@eptss/ui';

export const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      variant="ghost"
      size="sm"
      className="self-start mb-6 gap-2 text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] group"
      aria-label="Back to previous page"
    >
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block group-hover:-translate-x-1 transition-transform duration-200">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
      </svg>
      <span>Back</span>
    </Button>
  );
};
