/**
 * Skeleton for the reading room while records are pulled off the live network.
 * Renders inside AtprotoLayout's paper/ink ground, so the wait stays in the same
 * world as the page it precedes.
 */
export default function AtprotoLoading() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="h-9 w-2/3 rounded-sharp bg-line" />
      <div className="h-4 w-full rounded-sharp bg-line/70" />
      <div className="h-4 w-5/6 rounded-sharp bg-line/70" />
      <div className="mt-8 h-28 w-full rounded-sharp bg-line/60" />
      <div className="h-28 w-full rounded-sharp bg-line/60" />
    </div>
  );
}
