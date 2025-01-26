"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/client/LoginForm/LoginForm";
import { Button } from "@/components/ui/button";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Login | Everyone Plays the Same Song",
  description: "Sign in to your Everyone Plays the Same Song account to participate in the current round, submit covers, and vote.",
  openGraph: {
    title: "Login | Everyone Plays the Same Song",
    description: "Sign in to your Everyone Plays the Same Song account to participate in the current round, submit covers, and vote.",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectUrl = searchParams.get('redirectUrl');
  const titleOverride = searchParams.get('titleOverride');

  return (
    <div className="min-h-screen flex items-start justify-center pt-20 bg-black">
      <div className="w-full max-w-[500px] px-8 py-6 rounded-lg">
        <LoginForm 
          redirectUrl={redirectUrl || undefined}
          titleOverride={titleOverride || undefined}
        />
        <div className="w-full flex justify-center">
          <Button
            className="w-32 mt-4"
            onClick={() => router.push("/")}
            variant="secondary"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
} 