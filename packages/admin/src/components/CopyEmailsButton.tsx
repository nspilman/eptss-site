"use client";

import { useState, type ComponentProps } from "react";
import { Button, useToast } from "@eptss/ui";
import { Mail, Loader2 } from "lucide-react";

type CopyEmailsButtonProps = {
  /** Either a pre-loaded email list, or an async loader called on click */
  source: string[] | (() => Promise<string[]>);
  /** Override the auto-generated label (e.g. "Copy Active User Emails") */
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
};

export function CopyEmailsButton({
  source,
  label,
  variant = "secondary",
  size = "sm",
}: CopyEmailsButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isAsync = typeof source === "function";
  const staticCount = !isAsync ? source.length : undefined;

  const handleCopy = async () => {
    if (isAsync) setIsLoading(true);
    try {
      const emails = isAsync ? await source() : source;
      await navigator.clipboard.writeText(emails.join(", "));
      toast({
        title: "Copied!",
        description: `${emails.length} email${emails.length !== 1 ? "s" : ""} copied to clipboard`,
      });
    } catch (error) {
      console.error("Error copying emails:", error);
      toast({
        title: "Error",
        description: "Failed to copy emails to clipboard",
        variant: "destructive",
      });
    } finally {
      if (isAsync) setIsLoading(false);
    }
  };

  const defaultLabel =
    staticCount !== undefined
      ? `Copy ${staticCount} Email${staticCount !== 1 ? "s" : ""}`
      : "Copy Emails";

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Mail className="w-4 h-4" />
      )}
      {isLoading ? "Loading..." : label ?? defaultLabel}
    </Button>
  );
}
