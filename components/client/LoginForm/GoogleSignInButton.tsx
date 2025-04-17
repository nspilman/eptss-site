"use client";

import { Button } from "@/components/ui/primitives";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export function GoogleSignInButton({ redirectUrl = "/dashboard" }: { redirectUrl?: string }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/google/callback` : redirectUrl;
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      size="full"
      variant="secondary"
      className="mt-2 flex items-center justify-center gap-2"
    >
      <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_17_40)">
          <path d="M47.5 24.5C47.5 22.6 47.3 21.1 47 19.5H24V28.7H37.6C37.3 31.1 35.7 34.2 32.3 36.3L32.2 36.9L39.4 42.3L39.9 42.8C44.3 39 47.5 32.7 47.5 24.5Z" fill="#4285F4"/>
          <path d="M24 48C30.8 48 36.4 45.7 39.9 42.8L32.3 36.3C30.5 37.5 28.1 38.3 24 38.3C17.5 38.3 12.1 34.2 10.3 28.9L10.2 28.9L2.7 34.5L2.6 35C6.1 42.3 14.3 48 24 48Z" fill="#34A853"/>
          <path d="M10.3 28.9C9.8 27.3 9.5 25.6 9.5 24C9.5 22.4 9.8 20.7 10.3 19.1L10.3 19L2.7 13.3L2.6 13C1 16.2 0 19.9 0 24C0 28.1 1 31.8 2.6 35L10.3 28.9Z" fill="#FBBC05"/>
          <path d="M24 9.7C28.1 9.7 30.9 11.4 32.6 13L40 6.1C36.4 2.7 30.8 0 24 0C14.3 0 6.1 5.7 2.6 13L10.3 19.1C12.1 13.8 17.5 9.7 24 9.7Z" fill="#EA4335"/>
        </g>
        <defs>
          <clipPath id="clip0_17_40">
            <rect width="48" height="48" fill="white"/>
          </clipPath>
        </defs>
      </svg>
      {loading ? "Redirecting..." : "Sign in with Google"}
    </Button>
  );
}
