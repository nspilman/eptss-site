"use client";

import { Button } from "@/components/ui/primitives";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface EmailConfirmationScreenProps {
  email: string;
  roundId: number;
}

export function EmailConfirmationScreen({ email, roundId }: EmailConfirmationScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl"
    >
      <div className="rounded-xl bg-background-tertiary p-8 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 h-24 w-24 overflow-hidden rounded-full bg-background-secondary">
            <Image
              src="/images/email-sent.svg"
              alt="Email sent"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          
          <h2 className="mb-4 font-fraunces text-3xl font-bold text-primary">
            Check Your Email
          </h2>
          
          <div className="mb-6 max-w-lg">
            <p className="mb-4 text-accent-primary">
              We&apos;ve sent a verification link to <span className="font-semibold">{email}</span>
            </p>
            <p className="text-accent-primary opacity-90">
              Please click the link in the email to complete your signup for Round {roundId} of Everyone Plays the Same Song.
            </p>
          </div>
          
          <div className="mt-2 rounded-lg bg-background-secondary p-6">
            <h3 className="mb-2 font-medium text-primary">What happens next?</h3>
            <ol className="ml-5 list-decimal text-left text-accent-primary opacity-90">
              <li className="mb-2">Check your inbox for the verification email</li>
              <li className="mb-2">Click the link in the email to verify your signup</li>
              <li>You&apos;ll be redirected to your dashboard where you can see your signup status</li>
            </ol>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/" className="min-w-[150px]">
              <Button
                variant="secondary"
                className="w-full"
              >
                Return Home
              </Button>
            </Link>
            
            <a href={`mailto:${email}`} className="min-w-[150px]">
              <Button
                variant="default"
                className="w-full"
              >
                Open Email App
              </Button>
            </a>
          </div>
          
          <p className="mt-6 text-sm text-accent-primary opacity-70">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Link href="/sign-up" className="text-accent-primary underline hover:text-accent-secondary">
              try signing up again
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
