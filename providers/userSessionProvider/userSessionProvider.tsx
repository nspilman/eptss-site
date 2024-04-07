"use server";
import { userSessionService } from "@/data-access/userSessionService";

export const userSessionProvider = async () => {
  const { user, session } = await userSessionService.getUserSession();
  const { signOut } = userSessionService;

  const userId = user?.id || "";
  if (!userId) {
    return {
      session: undefined,
      signOut: undefined,
      userId: "",
    };
  }

  return {
    session,
    signOut,
    userId,
  };
};
