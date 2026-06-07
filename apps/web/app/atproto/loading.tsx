import { Skeleton } from '@eptss/ui';

/** Skeleton for the reading room while records are pulled off the live network. */
export default function AtprotoLoading() {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="space-y-4 pt-4">
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    </div>
  );
}
