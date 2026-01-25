import { signInWithOTP, signOut, signInWithPassword, signUpWithPassword } from "../../services/userSessionService";

export const userSessionProvider = async () => {
  return {
    signOut,
    signInWithOTP,
    signInWithPassword,
    signUpWithPassword,
  };
};
