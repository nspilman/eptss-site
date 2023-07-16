import { useSessionContext, User } from "@supabase/auth-helpers-react";
import { AuthError } from "@supabase/supabase-js";
import { Tables } from "queries";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRound } from "../RoundContext";

// Create a Context object
export const UserSessionContext = createContext<
  | {
      user?: User;
      isLoading: boolean;
      isUserInRound?: boolean;
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

  const [isUserInRound, setIsUserInRound] = useState(false);
  const [isLoadingUserRound, setIsLoadingUserRound] = useState(false);

  useEffect(() => {
    const getIsUserInRound = async (roundId: number, userId: string) => {
      setIsLoadingUserRound(true);
      const { data } = await supabaseClient
        .from(Tables.SignUps)
        .select("*")
        .filter("round_id", "eq", roundId)
        .filter("user_id", "eq", session?.user.id);
      if (data) {
        setIsUserInRound(true);
      }
      setIsLoadingUserRound(false);
    };
    if (roundId && session?.user) {
      getIsUserInRound(roundId, session.user.id);
    }
  }, [roundId, session?.user, supabaseClient]);

  const signOut = () => supabaseClient.auth.signOut();

  const value = {
    user: session?.user,
    isLoading: isLoadingUser || isLoadingUserRound,
    isUserInRound,
    signOut,
  };

  return (
    <UserSessionContext.Provider value={value}>
      {children}
    </UserSessionContext.Provider>
  );
};
