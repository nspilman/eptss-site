"use client";

import { PasswordAuthForm } from "@eptss/auth/components";
import { Card } from "@eptss/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@eptss/data-access/utils/supabase/client";
import { routes } from "@eptss/routing";

export default function PasswordAuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.push(routes.dashboard.root());
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [router, supabase]);

  // Handle form success - redirect to dashboard
  const handleSuccess = () => {
    router.refresh(); // Refresh the page to update auth state
    router.push(routes.dashboard.root()); // Redirect to dashboard
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md p-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <PasswordAuthForm
            titleOverride="Test Authentication"
            redirectUrl={routes.dashboard.root()}
            onSuccess={handleSuccess}
          />
        )}
      </Card>
    </div>
  );
}
