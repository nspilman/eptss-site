"use client";

import { useState } from "react";
import { Button, useToast } from "@eptss/ui";
import { Mail, Loader2 } from "lucide-react";
import { getActiveUserEmails } from "@eptss/data-access";

export function CopyActiveEmailsButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyEmails = async () => {
    setIsLoading(true);

    try {
      const emails = await getActiveUserEmails();
      const emailString = emails.join(", ");

      await navigator.clipboard.writeText(emailString);

      toast({
        title: "Copied!",
        description: `${emails.length} active user email${emails.length !== 1 ? "s" : ""} copied to clipboard`,
      });
    } catch (error) {
      console.error("Error fetching or copying emails:", error);
      toast({
        title: "Error",
        description: "Failed to fetch or copy emails to clipboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCopyEmails}
      variant="default"
      size="md"
      className="gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Mail className="w-4 h-4" />
          Copy Active User Emails
        </>
      )}
    </Button>
  );
}
