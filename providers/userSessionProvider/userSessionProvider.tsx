import { getUser, signInWithOTP, signOut } from "@/data-access";

export const userSessionProvider = async () => {
  const { user } = await getUser();

  const userId = user?.id || "";

  return {
    signOut,
    userId,
    signInWithOTP: signInWithOTP,
  };
};
