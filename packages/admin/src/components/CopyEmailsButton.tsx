"use client";

import { useState } from "react";
import { Button } from "@eptss/ui";
import { Mail, Check } from "lucide-react";

type SignupData = {
  email?: string | null;
  [key: string]: any;
};

type CopyEmailsButtonProps = {
  signups: SignupData[];
};

export function CopyEmailsButton({ signups }: CopyEmailsButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmails = async () => {
    // Extract emails, filter out null/undefined, and join with commas
    const emails = signups
      .map((signup) => signup.email)
      .filter((email): email is string => !!email)
      .join(", ");

    try {
      await navigator.clipboard.writeText(emails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy emails:", error);
    }
  };

  const emailCount = signups.filter((s) => s.email).length;

  return (
    <Button
      onClick={handleCopyEmails}
      variant={copied ? "default" : "secondary"}
      size="sm"
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" />
          Copy {emailCount} Email{emailCount !== 1 ? "s" : ""}
        </>
      )}
    </Button>
  );
}
