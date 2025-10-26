"use server";

import { redirect } from "next/navigation";
import { getAuthUser } from "../utils/getAuthUser";

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export async function RequireAuth({ children, redirectTo = "/login" }: RequireAuthProps) {
  const { userId } = await getAuthUser();
  
  if (!userId) {
    redirect(redirectTo);
  }
  
  return <>{children}</>;
}