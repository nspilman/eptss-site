import React from "react";
import { Button } from "@/components/ui/primitives";
import Link from "next/link";
import { Metadata } from 'next';
import { LoginForm } from "@/components/client/LoginForm";

export const metadata: Metadata = {
  title: "Login | Everyone Plays the Same Song",
  description: "Sign in to your Everyone Plays the Same Song account to participate in the current round, submit covers, and vote.",
  openGraph: {
    title: "Login | Everyone Plays the Same Song",
    description: "Sign in to your Everyone Plays the Same Song account to participate in the current round, submit covers, and vote.",
  },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectUrl?: string; titleOverride?: string };
}) {
  return (
    <div className="min-h-screen flex items-start justify-center pt-20 bg-black">
      <div className="w-full max-w-[500px] px-8 py-6 rounded-lg">
        <LoginForm 
          redirectUrl={searchParams.redirectUrl}
          titleOverride={searchParams.titleOverride}
        />
        <div className="w-full flex justify-center">
          <Link href="/">
            <Button
              className="w-32 mt-4"
              variant="ghost"
            >
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}