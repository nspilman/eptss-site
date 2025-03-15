'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/primitives';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1e]">
      <div className="p-8 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-xs max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 rounded-full border-2 border-[#e2e240] flex items-center justify-center">
            <span className="text-[#e2e240] text-4xl font-bold">!</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4 leading-tight">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-[#e2e240] to-[#40e2e2]">
            Something went wrong
          </span>
        </h1>
        <p className="text-gray-300 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="space-y-3">
          <Button 
            onClick={reset}
            className="w-full bg-[#e2e240] text-gray-900 hover:bg-[#e2e240]/90"
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
