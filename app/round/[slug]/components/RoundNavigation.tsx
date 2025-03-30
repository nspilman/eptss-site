"use client";

import React from "react";
import Link from "next/link";

interface NavigationProps {
  navigation: {
    next?: number;
    previous?: number;
    nextSlug?: string;
    previousSlug?: string;
  };
}

export const RoundNavigation: React.FC<NavigationProps> = ({ navigation }) => {
  return (
    <div className="flex justify-between w-full">
      {navigation.previous ? (
<<<<<<< HEAD
        <Link href={`/round/${navigation.previousSlug || navigation.previous}`}>
          <button className="btn-main">Previous Round</button>
        </Link>
      ) : <div/>}
      
      {navigation.next ? (
        <Link href={`/round/${navigation.nextSlug || navigation.next}`}>
          <button className="btn-main">Next Round</button>
        </Link>
      ) : <div/>}
=======
        <a href={`/round/${navigation.previousSlug || navigation.previous}`}>
          <button className="btn-main">Round {navigation.previous}</button>
        </a>
      ) : <div/>}
      
      {navigation.next ? (
        <a href={`/round/${navigation.nextSlug || navigation.next}`}>
          <button className="btn-main">Round {navigation.next}</button>
        </a>
      ) : <></>}
>>>>>>> 88de1ea (referencing rounds by slug)
    </div>
  );
};
