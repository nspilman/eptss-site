"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/components/ui/primitives";

export const LoadingSpinner = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = 65, ...props }, ref) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(66);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex justify-center items-center">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-4 w-4 overflow-hidden rounded-full bg-gray-200/20",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-gray-900 transition-all animate-spin"
          style={{ transform: `translateX(-${100 - progress}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";
