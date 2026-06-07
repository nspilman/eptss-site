'use client';

/**
 * The reading room degrades gracefully. Reads go straight to the live AT Protocol
 * network, so a slow or unreachable PDS shouldn't shatter the page — this boundary
 * catches a failed *render* and offers to try again. The records themselves are
 * safe on the network; this is only the view of them.
 */
import { useEffect } from 'react';

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
    <div className="py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        The reading room is quiet
      </h1>
      <p className="mt-3 max-w-prose leading-relaxed text-ink-2">
        We couldn&apos;t reach the network just now. Nothing is lost — the records
        live on the AT Protocol; this is only the view of them.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-sharp border border-line px-4 py-2 text-sm text-signal hover:underline"
      >
        Try again
      </button>
    </div>
  );
}
