import { Skeleton } from "@/components/ui/primitives";

export function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-72" />
      <Skeleton className="h-96" />
      <Skeleton className="h-64" />
    </div>
  );
}