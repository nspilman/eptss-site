"use server";

import { redirect } from "next/navigation";
import { getAuthUser } from "../utils/getAuthUser";
import { isAdmin } from "../utils/isAdmin";

interface RequireAdminProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export async function RequireAdmin({ children, redirectTo = "/" }: RequireAdminProps) {
  const { userId } = await getAuthUser();
  
  // Redirect non-authenticated users to login
  if (!userId) {
    redirect("/login");
  }

  // Check if user is admin
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    redirect(redirectTo);
  }
  
  return <>{children}</>;
}