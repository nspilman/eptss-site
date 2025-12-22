"use client";

import { Button, Card, CardContent, Heading, Text, AlertBox } from "@eptss/ui";
import { motion } from "framer-motion";
import Link from "next/link";
import { routes } from "@eptss/routing";

interface EmailConfirmationScreenProps {
  email: string;
  roundId: number;
  projectSlug: string;
}

export function EmailConfirmationScreen({ email, roundId, projectSlug }: EmailConfirmationScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl"
    >
      <Card className="text-center">
        <CardContent className="pt-8 pb-8 space-y-8">
          {/* Header Callout */}
          <AlertBox
            variant="warning"
            icon={false}
            className="border-4 border-accent-secondary bg-accent-secondary/20"
          >
            <div className="text-center w-full">
              <div className="flex justify-center mb-3">
                <span className="text-5xl">⚠️</span>
              </div>
              <Heading size="lg" className="text-accent-secondary mb-2">
                One More Step!
              </Heading>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Text size="lg" className="font-semibold">
                  We sent a verification link to:
                </Text>
                <div className="inline-block bg-accent-primary text-background-primary px-6 py-3 rounded-lg text-xl font-bold">
                  {email}
                </div>
              </div>
            </div>
          </AlertBox>

          {/* CTA Alert Box */}
          <AlertBox
            variant="info"
            icon={false}
            className="border-2 border-blue-500/30"
          >
            <div className="space-y-4 w-full">
              <div className="flex justify-center">
                <span className="text-4xl">📧</span>
              </div>
              <Heading size="lg" className="text-primary text-center">
                Click the link in your email to complete signup
              </Heading>
              <ol className="ml-6 list-decimal text-left space-y-2">
                <Text size="base" as="li" className="font-semibold">
                  Check your inbox (and spam folder)
                </Text>
                <Text size="base" as="li" className="font-semibold">
                  Click the verification link in the email
                </Text>
                <Text size="base" as="li" className="font-semibold">
                  You&apos;ll be redirected to your dashboard
                </Text>
              </ol>
            </div>
          </AlertBox>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={routes.home()} className="min-w-[150px]">
              <Button variant="secondary" className="w-full">
                Return Home
              </Button>
            </Link>
            <a href={`mailto:${email}`} className="min-w-[150px]">
              <Button variant="default" className="w-full">
                Open Email App
              </Button>
            </a>
          </div>

          {/* Help Text */}
          <Text size="sm" className="opacity-70">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Link href={routes.projects.signUp.root(projectSlug)} className="underline hover:text-accent-secondary">
              try signing up again
            </Link>
          </Text>
        </CardContent>
      </Card>
    </motion.div>
  );
}
