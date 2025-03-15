"use client";

import React from "react";
import { Button } from "@/components/ui/primitives";
import Link from "next/link";
import { LoginForm } from "@/components/client/LoginForm/LoginForm";



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