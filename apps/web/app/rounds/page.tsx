import { RoundsDisplay } from "@/app/index/Homepage/RoundsDisplay";
import { Suspense } from "react";

export default async function RoundsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={
          <div className="py-16 bg-[var(--color-background-secondary)] rounded-xl">
            <div className="max-w-5xl mx-auto px-4 flex justify-center items-center h-40">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-t-2 border-[var(--color-accent-primary)] rounded-full animate-spin mb-4"></div>
                <p className="text-[var(--color-primary)]">Loading rounds...</p>
              </div>
            </div>
          </div>
        }>
          <RoundsDisplay />
        </Suspense>
      </div>
    </main>
  );
}
