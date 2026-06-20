'use client';

/**
 * The reading room degrades gracefully. Reads go straight to the live AT Protocol
 * network, so a slow or unreachable PDS shouldn't shatter the page — this boundary
 * catches a failed render and offers to try again. The records themselves are safe
 * on the network; this is only the view of them.
 */
import { useEffect } from 'react';
import { Button } from '@eptss/ui';

export default function AtprotoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[atproto] read-room render failed:', error);
  }, [error]);

  return (
    <div className="py-12 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-100">
        Couldn&apos;t reach the network
      </h1>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-gray-400">
        Nothing is lost — these rounds live as records on the AT Protocol. This is
        only the view of them.
      </p>
      <Button onClick={reset} variant="outline" className="mt-6">
        Try again
      </Button>
    </div>
  );
}
