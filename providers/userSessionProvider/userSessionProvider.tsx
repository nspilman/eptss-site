import { getUserSession, signInWithOTP, signOut } from "@/data-access";

export const userSessionProvider = async () => {
  const { user, session } = await getUserSession();

  const userId = user?.id || "";

  return {
    session,
    signOut,
    userId,
    signInWithOTP: signInWithOTP,
  };
};
