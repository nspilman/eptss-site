"use client";

import { useState } from "react";
import { WaitlistForm } from "./WaitlistForm";
import { ActionSuccessPanel } from "@/components/ActionSuccessPanel/ActionSuccessPanel";
import { Card, CardContent } from "@eptss/ui";
import { RoundInfo } from "@eptss/data-access/types/round";

interface WaitlistPageClientProps {
  roundToDisplay: RoundInfo;
}

export function WaitlistPageClient({ roundToDisplay }: WaitlistPageClientProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSuccess = () => {
    setIsSubmitted(true);
  };

  const waitlistSuccessText = {
    header: "Thanks for joining the waitlist!",
    body: "We'll let you know when signups are open for the next round.",
    thankyou: "We appreciate your interest in Everyone Plays the Same Song.",
  };

  const waitlistSuccessImage = {
    src: "/welcomeimage.png",
    alt: "Everyone Plays the Same Song Waitlist",
    blurSrc: "welcome-image-blur.png",
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Join the Waitlist</h1>
      <Card variant="plain">
        <CardContent>
          {isSubmitted ? (
            <ActionSuccessPanel
              text={waitlistSuccessText}
              image={waitlistSuccessImage}
              roundId={roundToDisplay.roundId}
            />
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl mb-4">
                  Next Round: {roundToDisplay.roundId}
                </h2>
                {roundToDisplay.song?.title && (
                  <p className="text-secondary">
                    Song: {roundToDisplay.song.title} by {roundToDisplay.song.artist}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <p className="text-secondary">
                  Join our waitlist to be notified when spots open up in future rounds.
                  We&apos;ll email you as soon as registration becomes available.
                </p>
                <WaitlistForm onSuccess={handleSuccess} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
