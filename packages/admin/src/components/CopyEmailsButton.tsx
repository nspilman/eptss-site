"use client";

import { Button, useToast } from "@eptss/ui";
import { Mail } from "lucide-react";

type SignupData = {
  email?: string | null;
  [key: string]: any;
};

type CopyEmailsButtonProps = {
  signups: SignupData[];
};

export function CopyEmailsButton({ signups }: CopyEmailsButtonProps) {
  const { toast } = useToast();

  const emailCount = signups.filter((s) => s.email).length;

  const handleCopyEmails = async () => {
    const emails = signups
      .map((signup) => signup.email)
      .filter((email): email is string => !!email)
      .join(", ");

    try {
      await navigator.clipboard.writeText(emails);
      toast({
        title: "Copied!",
        description: `${emailCount} email${emailCount !== 1 ? "s" : ""} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy emails to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleCopyEmails}
      variant="secondary"
      size="sm"
      className="gap-2"
    >
      <Mail className="w-4 h-4" />
      Copy {emailCount} Email{emailCount !== 1 ? "s" : ""}
    </Button>
  );
}
