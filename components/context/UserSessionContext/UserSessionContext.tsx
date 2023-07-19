import { useSessionContext, User } from "@supabase/auth-helpers-react";
import { AuthError } from "@supabase/supabase-js";
import { getRoundDataForUser } from "queries/getRoundDataForUser";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRound } from "../RoundContext";

// Create a Context object
export const UserSessionContext = createContext<
  | {
      user?: User;
      isLoading: boolean;
      userRoundDetails: {
        hasSignedUp: boolean;
        hasSubmitted: boolean;
        hasVoted: boolean;
      };
      signOut: () => Promise<{
        error: AuthError | null;
      }>;
    }
  | undefined
>(undefined);

// Define a custom hook for easy access to the UserSessionContext
export const useUserSession = () => {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error("useUserSession must be used within a UserSessionProvider");
  }
  return context;
};

// Define the context provider component
export const UserSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    isLoading: isLoadingUser,
    session,
    supabaseClient,
  } = useSessionContext();
  const { roundId } = useRound();

  const userId = session?.user.id;

  const signOut = () => supabaseClient.auth.signOut();

  const [loadingUserRoundDetails, setLoadingUserRoundDetails] = useState(true);
  const [userRoundDetails, setUserRoundDetails] = useState({
    hasSignedUp: false,
    hasSubmitted: false,
    hasVoted: false,
  });

  const getUserRoundDetails = useCallback(
    async (userId: string) => {
      if (!roundId) {
        return;
      }
      try {
        const data = await getRoundDataForUser(roundId, userId);
        setUserRoundDetails(
          data as {
            hasSubmitted: boolean;
            hasVoted: boolean;
            hasSignedUp: boolean;
          }
        );
      } finally {
        setLoadingUserRoundDetails(false);
      }
    },
    [roundId]
  );

  useEffect(() => {
    if (!userId) {
      setLoadingUserRoundDetails(false);
      return;
    }
    getUserRoundDetails(userId);
  }, [getUserRoundDetails, userId]);

  const value = {
    user: session?.user,
    isLoading: isLoadingUser || loadingUserRoundDetails,
    userRoundDetails,
    signOut,
  };

  return (
    <UserSessionContext.Provider value={value}>
      {children}
    </UserSessionContext.Provider>
  );
};
