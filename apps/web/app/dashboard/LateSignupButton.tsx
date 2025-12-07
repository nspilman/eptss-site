"use client";

import { useState } from "react";
import { Button, useToast } from "@eptss/ui";
import { signupForRound } from "@/actions/userParticipationActions";
import { useRouter } from "next/navigation";

interface LateSignupButtonProps {
  projectId: string;
  roundId: number;
  userId: string;
  className?: string;
}

export function LateSignupButton({ projectId, roundId, userId, className }: LateSignupButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignup = async () => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("roundId", roundId.toString());
      formData.append("userId", userId);

      const result = await signupForRound(formData);

      if (result.status === "Success") {
        toast({
          title: "Success!",
          description: result.message,
          variant: "default",
        });
        // Refresh the page to update the dashboard
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="lg"
      className={className}
      onClick={handleSignup}
      disabled={isLoading}
    >
      <span>{isLoading ? "Joining..." : "Join Round (Late Signup)"}</span>
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </Button>
  );
}
