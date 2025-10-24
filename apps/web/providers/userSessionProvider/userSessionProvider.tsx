import { signInWithOTP, signOut, signInWithPassword, signUpWithPassword } from "@/data-access";

export const userSessionProvider = async () => {
  return {
    signOut,
    signInWithOTP,
    signInWithPassword,
    signUpWithPassword,
  };
};
