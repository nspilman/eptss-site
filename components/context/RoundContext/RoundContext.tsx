import React, { createContext, useContext, useEffect, useState } from "react";
import { Phase, PhaseMgmtService } from "services/PhaseMgmtService";

// Create a Context object
const RoundContext = createContext<
  | {
      isLoading: boolean;
      roundId?: number;
      phase?: Phase;
    }
  | undefined
>(undefined);

// Define a custom hook for easy access to the RoundContext
export const useRound = () => {
  const context = useContext(RoundContext);
  if (context === undefined) {
    throw new Error("useRound must be used within a RoundProvider");
  }
  return context;
};

// Define the context provider component
export const RoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [phaseMgmtService, setPhaseMgmtService] = useState<PhaseMgmtService>();

  useEffect(() => {
    const getPhase = async () => {
      const phaseMgmtService = await PhaseMgmtService.build();
      setPhaseMgmtService(await phaseMgmtService);
    };
    getPhase();
  }, []);

  const value = {
    isLoading: !phaseMgmtService,
    roundId: phaseMgmtService?.roundId,
    phase: phaseMgmtService?.phase,
  };

  return (
    <RoundContext.Provider value={value}>{children}</RoundContext.Provider>
  );
};
