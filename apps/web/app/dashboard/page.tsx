import { Suspense } from 'react';
import { DashboardHero,
  NextRoundSkeleton,
   HeroSkeleton,
    CurrentRoundSkeleton,
     URLParamsHandler,
      VerificationAlert,
       CurrentRoundCard,
        NextRoundCard } from './components';

// Force dynamic rendering for authenticated content
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardPage() {
  return (
    <div>
      {/* URL params handler for toast notifications */}
      <URLParamsHandler />

      {/* Hero Section - Streams independently */}
      <Suspense fallback={<HeroSkeleton />}>
        <DashboardHero />
      </Suspense>

      {/* Verification Alert - Streams independently */}
      <Suspense fallback={null}>
        <VerificationAlert />
      </Suspense>

      {/* Current Round Card - Streams independently */}
      <Suspense fallback={<CurrentRoundSkeleton />}>
        <CurrentRoundCard />
      </Suspense>

      {/* Next Round Card - Streams independently */}
      <Suspense fallback={<NextRoundSkeleton />}>
        <NextRoundCard />
      </Suspense>
    </div>
  );
}
