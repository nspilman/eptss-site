"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface UserParticipationState {
  isAuthenticated: boolean;
  hasVoted: boolean;
  hasSignedUp: boolean;
  hasSubmitted: boolean;
  isLoading: boolean;
}

const defaultState: UserParticipationState = {
  isAuthenticated: false,
  hasVoted: false,
  hasSignedUp: false,
  hasSubmitted: false,
  isLoading: true,
};

const UserParticipationContext = createContext<UserParticipationState>(defaultState);

export function useUserParticipation() {
  return useContext(UserParticipationContext);
}

interface Props {
  roundId: number;
  children: ReactNode;
}

export function UserParticipationProvider({ roundId, children }: Props) {
  const [state, setState] = useState<UserParticipationState>(defaultState);

  useEffect(() => {
    async function fetchParticipation() {
      try {
        const response = await fetch(`/api/user/round-participation?roundId=${roundId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch participation');
        }
        const data = await response.json();
        setState({
          isAuthenticated: data.isAuthenticated,
          hasVoted: data.hasVoted,
          hasSignedUp: data.hasSignedUp,
          hasSubmitted: data.hasSubmitted,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching user participation:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchParticipation();
  }, [roundId]);

  return (
    <UserParticipationContext.Provider value={state}>
      {children}
    </UserParticipationContext.Provider>
  );
}
