import { getUser, signInWithOTP, signOut } from "@/data-access";

export const userSessionProvider = async () => {
  const { user } = await getUser();

  const userId = user?.id || "";
  const email = user?.email || "";

  return {
    signOut,
    userId,
    email,
    signInWithOTP: signInWithOTP,
  };
};
