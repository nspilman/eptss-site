'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/primitives';
import * as Sentry from '@sentry/nextjs';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-primary)]">
      <div className="p-8 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-xs max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 rounded-full border-2 border-[var(--color-accent-primary)] flex items-center justify-center">
            <span className="text-[var(--color-accent-primary)] text-4xl font-bold">!</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4 leading-tight">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
            Something went wrong
          </span>
        </h1>
        <p className="text-gray-300 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="space-y-3">
          <Button 
            onClick={reset}
            className="w-full bg-[var(--color-accent-primary)] text-gray-900 hover:bg-[var(--color-accent-primary)] hover:opacity-90"
          >
            Try again
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Return home
          </Button>
        </div>
      </div>
    </div>
  );
}
