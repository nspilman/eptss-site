"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@eptss/ui";

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
        <Button asChild>
          <Link href={`/round/${navigation.previousSlug}`}>
            Previous Round
          </Link>
        </Button>
      ) : <div/>}

      {navigation.nextSlug ? (
        <Button asChild>
          <Link href={`/round/${navigation.nextSlug}`}>
            Next Round
          </Link>
        </Button>
      ) : <div/>}
    </div>
  );
};
