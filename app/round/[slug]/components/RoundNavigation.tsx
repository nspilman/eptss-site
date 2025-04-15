"use client";

import React from "react";
import Link from "next/link";

interface NavigationProps {
  navigation: {
    nextSlug?: string;
    previousSlug?: string;
  };
}

export const RoundNavigation: React.FC<NavigationProps> = ({ navigation }) => {
  return (
    <div className="flex justify-between w-full">
      {navigation.previousSlug ? (
        <Link href={`/round/${navigation.previousSlug}`}>
          <button className="btn-main">Previous Round</button>
        </Link>
      ) : <div/>}
      
      {navigation.nextSlug ? (
        <Link href={`/round/${navigation.nextSlug}`}>
          <button className="btn-main">Next Round</button>
        </Link>
      ) : <div/>}
    </div>
  );
};
