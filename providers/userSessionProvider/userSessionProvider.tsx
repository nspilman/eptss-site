import { signInWithOTP, signOut } from "@/data-access";

export const userSessionProvider = async () => {

  return {
    signOut,
    signInWithOTP: signInWithOTP,
  };
};
