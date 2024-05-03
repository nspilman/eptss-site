"use client";
import { Phase } from "@/types";
import { CTA } from "./CTA";
import { differenceInMilliseconds } from "date-fns";
import { useBlurb } from "../HowItWorks/useBlurb";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/components/client/context/EmailAuthModalContext";
import { Navigation } from "@/enum/navigation";
import { UserRoundDetails, songDetails } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  phase: Phase;
  roundId: number;
  phaseEndsDate: string;
  phaseEndsDatelabel: string;
  userRoundDetails?: UserRoundDetails;
  song: songDetails;
}

export const RoundActionCard = ({
  phase,
  roundId,
  phaseEndsDate,
  phaseEndsDatelabel,
  userRoundDetails,
  song,
}: Props) => {
  const router = useRouter();
  const { setIsOpen: openAuthModal } = useAuthModal();

  const isAuthed = !!userRoundDetails?.user?.userid;

  const completedCheckByPhase: { [key in Phase]: boolean } = {
    signups: userRoundDetails?.hasSignedUp || false,
    covering: userRoundDetails?.hasSubmitted || false,
    voting: userRoundDetails?.hasVoted || false,
    celebration: userRoundDetails?.hasSubmitted || false,
  };

  // const hasCompletedPhase = completedCheckByPhase[phase];
  const roundActionFunctions = {
    // onProfile: () => router.push(Navigation.Profile),
    onSignup: () => openAuthModal(),
    onSignupAndJoinRound: () => router.push(Navigation.SignUp),
    onJoinRound: () => router.push(Navigation.SignUp),
    onVote: () => router.push(Navigation.Voting),
    onSubmit: () => router.push(Navigation.Submit),
    onRoundDetails: () => router.push(`/round/${roundId}`),
  };

  const { title: songTitle, artist: songArtist } = song;

  const phaseEndsDaysFromToday =
    // calculates the difference in milliseconds and then rounds up
    Math.ceil(
      differenceInMilliseconds(new Date(phaseEndsDate), new Date()) /
        (1000 * 60 * 60 * 24)
    );

  const specificDaysOrSoonLabel =
    phaseEndsDaysFromToday < 0
      ? "soon"
      : `in ${phaseEndsDaysFromToday} day${
          phaseEndsDaysFromToday !== 1 ? "s" : ""
        }`;

  const labelContent = (() => {
    const authedLabels: { [key in Phase]: string } = {
      signups: `Next round starts ${specificDaysOrSoonLabel}`,
      celebration: `Stay tuned for next round details!`,
      voting: `Voting ends ${specificDaysOrSoonLabel}`,
      covering: `Round ends ${specificDaysOrSoonLabel}`,
    };

    if (isAuthed) {
      return authedLabels[phase];
    } else {
      return phase === "signups" ? (
        <>{`Next round starts in ${phaseEndsDaysFromToday} days`}</>
      ) : (
        <>Notify me when next round starts</>
      );
    }
  })();
  phase = "covering"

  const {phaseStatus, phaseBlurb} = useBlurb({ phase, roundId, phaseEndsDatelabel });

  return (
    <Card className="mx-auto ">
        <CardHeader>
      <CardTitle>
              {phaseStatus}
      </CardTitle>
        <CardDescription>
          {phaseBlurb}
        </CardDescription>
        <div className="flex flex-col mx-auto items-center">
          <p>
            <span className="text-2xl">
            </span>
            <span className="text-lg">

            </span>
          </p>
        
        </div>
        </CardHeader>

      <CardContent>
        <div className="text-xl font-bold">
          {phase == "covering" ? <p>Covering : {songTitle} by {songArtist}</p> : '' }
        </div>
      <div>
                  <CTA
                    {...{
                      roundActionFunctions,
                      roundId,
                      hasCompletedPhase: false,
                      isAuthed,
                      phase,
                    }}
                  />
                </div>
      </CardContent>
    </Card>
  );
};

      // <div className="py-8 px-4 flex flex-col relative">
      //   <div>
      //     <div className="flex flex-col">
      //       <div className="flex flex-col items-center">
      //         <div className="text-white opacity-75">{labelContent}</div>
      //         <div className="pt-4 gap-4 flex flex-col items-center">
               
      //         </div>
      //       </div>
      //     </div>
      //   </div>
      // </div>