import DashboardLayout from "./DashboardLayout";
import { getAuthUser } from "@/utils/supabase/server";

/**
 * Conditionally wraps children in DashboardLayout if user is authenticated.
 * Otherwise renders children without the dashboard navigation.
 */
export default async function ConditionalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await getAuthUser();
  
  // If user is logged in, wrap in DashboardLayout
  if (userId) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }
  
  // Otherwise, render without dashboard layout
  return <>{children}</>;
}
