import React from "react";
import { Button } from "@eptss/ui";
import Link from "next/link";
import { LoginForm } from "@eptss/auth/components";



export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectUrl?: string; titleOverride?: string; ref?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="min-h-screen flex items-start justify-center pt-20 bg-black">
      <div className="w-full max-w-[500px] px-8 py-6 rounded-lg">
        <LoginForm
          redirectUrl={resolvedSearchParams.redirectUrl}
          titleOverride={resolvedSearchParams.titleOverride}
          referralCode={resolvedSearchParams.ref}
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