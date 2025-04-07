"use client";

import { PasswordAuthForm } from "@/components/client/PasswordAuthForm/PasswordAuthForm";
import { Card } from "@/components/ui/primitives";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function PasswordAuthPage() {
  const router = useRouter();
  const supabase = createClient();

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      }
    };
    
    checkSession();
  }, [router, supabase]);

  // Handle form success - redirect to dashboard
  const handleSuccess = () => {
    router.refresh(); // Refresh the page to update auth state
    router.push("/dashboard"); // Redirect to dashboard
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md p-8">
        <PasswordAuthForm 
          titleOverride="Test Authentication" 
          redirectUrl="/dashboard"
          onSuccess={handleSuccess}
        />
      </Card>
    </div>
  );
}
