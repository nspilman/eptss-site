import Head from "next/head";
import { RoundsDisplay } from "./index/Homepage/RoundsDisplay";
import { HowItWorks } from "./index/Homepage/HowItWorks";
import { Suspense } from "react";
import { Metadata } from 'next';
import { StaticHero } from "./StaticHero";
import { RoundInfoDisplay } from "./RoundInfoDisplay";
import { roundProvider } from "@eptss/data-access";

export const metadata: Metadata = {
  title: "Everyone Plays the Same Song | Quarterly Community Cover Project",
  description: "Every quarter, our community picks one song. Everyone creates their own unique cover version. Then we celebrate with a virtual listening party! Join our next round.",
  openGraph: {
    title: "Everyone Plays the Same Song | Quarterly Community Cover Project",
    description: "Every quarter, our community picks one song. Everyone creates their own unique cover version. Then we celebrate with a virtual listening party! Join our next round.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Everyone Plays the Same Song Community",
      },
    ],
  },
};

// Shared homepage content component that can be reused
export const HomepageContent = async () => {
  const roundInfo = await roundProvider();
  
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-16">
        <StaticHero />
        <div className="flex justify-center md:justify-end">
          <RoundInfoDisplay roundInfo={roundInfo} />
        </div>
      </div>
      <div className="space-y-24 mt-16 md:mt-24">
        <HowItWorks />
        <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading rounds...</div>}>
          <RoundsDisplay />
        </Suspense>
      </div>
    </div>
  );
};

const Homepage = async () => {
  return <HomepageContent />;
};

export default Homepage;
