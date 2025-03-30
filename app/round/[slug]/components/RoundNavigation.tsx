"use client";

import React from "react";

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
        <a href={`/round/${navigation.previousSlug || navigation.previous}`}>
          <button className="btn-main">Round {navigation.previous}</button>
        </a>
      ) : <div/>}
      
      {navigation.next ? (
        <a href={`/round/${navigation.nextSlug || navigation.next}`}>
          <button className="btn-main">Round {navigation.next}</button>
        </a>
      ) : <></>}
    </div>
  );
};
