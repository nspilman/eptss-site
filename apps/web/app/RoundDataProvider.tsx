"use client";

import { useEffect, useState } from "react";
import { ClientHero } from "./ClientHero";
import { Phase, RoundInfo } from "@eptss/data-access/types/round";
import { UserRoundParticipation } from "@eptss/data-access/types/user";

export const RoundDataProvider = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [roundInfo, setRoundInfo] = useState<RoundInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch round data
        const roundResponse = await fetch('/api/round/current');
        const roundData = await roundResponse.json();
    
    setRoundInfo(roundData);
    setIsLoading(false);
      }
    catch (error) {
      console.error({error})
    }
  }

      fetchData();
  }, []);
  console.log("WE OUT HERE")
  return (
    <div className="w-full max-w-md">
        <ClientHero
          roundInfo={roundInfo}
        />
    </div>
  );
};
