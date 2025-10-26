import { redirect } from "next/navigation";
import { getAuthUser } from "../utils/getAuthUser";

interface WithAuthOptions {
  redirectTo?: string;
  requireAdmin?: boolean;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return async function AuthenticatedComponent(props: P) {
    const { redirectTo = "/login", requireAdmin = false } = options;
    const { userId, email } = await getAuthUser();
    
    if (!userId) {
      redirect(redirectTo);
    }
    
    if (requireAdmin) {
      const isAdminUser = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || 
                         process.env.NODE_ENV === "development";
      
      if (!isAdminUser) {
        redirect("/");
      }
    }
    
    return <Component {...props} />;
  };
}