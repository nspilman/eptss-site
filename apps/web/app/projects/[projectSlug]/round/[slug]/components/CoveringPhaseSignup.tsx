"use client";

import { useState } from "react";
import { Badge, Button } from "@eptss/ui";
import { useRouter } from "next/navigation";
import { signupUserWithoutSong } from "@eptss/data-access";
import { createClient } from "@eptss/data-access/utils/supabase/client";
import { FormReturn } from "@/types";
import { routes } from "@eptss/routing";
import { useToast } from "@eptss/ui";
import { useRouteParams } from '../../../ProjectContext';

interface CoveringPhaseSignupProps {
  roundId: number;
  isSignedUp?: boolean;
}

export const CoveringPhaseSignup = ({ roundId, isSignedUp = false }: CoveringPhaseSignupProps) => {
  const { projectId } = useRouteParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is logged in
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // User is not logged in, redirect to login page with return URL
        router.push(`/login?redirectTo=/round/${roundId}`);
        return;
      }
      
      // User is logged in, proceed with signup
      const result = await signupUserWithoutSong({
        projectId,
        roundId,
        userId: session.user.id
      }) as FormReturn;
      
      // Convert status to number if it's a string
      const statusCode = typeof result.status === 'string' ? parseInt(result.status, 10) : result.status;
      if (statusCode === 200) {
        // Show success toast notification
        toast({
          title: "Success!",
          description: "You have successfully signed up for this round.",
          variant: "default",
        });

        // Redirect to dashboard
        router.push(routes.dashboard.root());
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An error occurred while signing up. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center">
      {isSignedUp ? (
        <div className="text-center mb-4">
          <Badge className="font-medium text-primary" variant="outline">You&apos;re signed up for this round!</Badge>
        </div>
      ) : (
        <>
          <Button 
            onClick={handleSignup} 
            disabled={isLoading}
            variant="default"
          >
            {isLoading ? "Signing up..." : "Sign up for this round"}
          </Button>
          
          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
          
          <p className="mt-3 text-center text-secondary text-sm max-w-md">
            Sign up to participate in this round! You&apos;ll be able to submit your cover once you&apos;ve signed up.
          </p>
        </>
      )}
    </div>
  );
};
