"use client";
import { Phase } from "services/PhaseMgmtService";
import { CTA } from "./CTA";
import { differenceInMilliseconds } from "date-fns";
import { useBlurb } from "../HowItWorks/useBlurb";
import { Loading } from "components/shared/Loading";
import { useRouter } from "next/navigation";
import { useAuthModal } from "components/context/EmailAuthModal";
import { Navigation } from "components/enum/navigation";
import { getUserSession } from "@/components/context/getUserSession";
import { Session } from "@supabase/supabase-js";
import { RoundDetails, UserRoundDetails } from "@/types";

interface Props {
  phase: Phase;
  roundId: number;
  phaseEndsDate: string;
  phaseEndsDatelabel: string;
  session: Session | null;
  userRoundDetails?: UserRoundDetails;
}

export const RoundActionCard = ({
  phase,
  roundId,
  phaseEndsDate,
  phaseEndsDatelabel,
  session,
  userRoundDetails,
}: Props) => {
  const router = useRouter();
  const { setIsOpen: openAuthModal } = useAuthModal();
  // console.log({ user, isLoading });
  const user = session?.user;

  const isAuthed = !!user;

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

  const blurb = useBlurb({ phase, roundId, phaseEndsDatelabel });

  return (
    <div className="py-8 px-4 flex flex-col relative">
      <div>
        <div className="flex flex-col">
          <div className="flex flex-col items-center">
            <div className="text-white opacity-75">{labelContent}</div>
            <div className="pt-4 gap-4 flex flex-col items-center">
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
              <span className="text-themeYellow font-fraunces">{blurb}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
