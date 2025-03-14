"use client";

import React from "react";

interface NavigationProps {
  navigation: {
    next?: number;
    previous?: number;
  };
}

export const RoundNavigation: React.FC<NavigationProps> = ({ navigation }) => {
  return (
    <div className="flex justify-between w-full">
      {navigation.previous ? (
        <a href={`/round/${navigation.previous}`}>
          <button className="btn-main">Round {navigation.previous}</button>
        </a>
      ) : <div/>}
      
      {navigation.next ? (
        <a href={`/round/${navigation.next}`}>
          <button className="btn-main">Round {navigation.next}</button>
        </a>
      ) : <></>}
    </div>
  );
};
