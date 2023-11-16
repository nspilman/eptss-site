import { Spinner } from "@chakra-ui/react";
import { Phase } from "services/PhaseMgmtService";
import { CTA, RoundActionFunctions } from "./CTA";
import { differenceInMilliseconds } from "date-fns";
import { useBlurb } from "../HowItWorks/useBlurb";

interface Props {
  phase: Phase;
  roundId: number;
  isAuthed: boolean;
  hasCompletedPhase: boolean;
  roundActionFunctions: RoundActionFunctions;
  loading?: boolean;
  phaseEndsDate: string;
  phaseEndsDatelabel: string;
}

export const RoundActionCard = ({
  roundActionFunctions,
  loading,
  isAuthed,
  hasCompletedPhase,
  phase,
  roundId,
  phaseEndsDate,
  phaseEndsDatelabel,
}: Props) => {
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
          {loading ? (
            <div className="h-[100px]">
              <Spinner color="white" />
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="text-white">{labelContent}</div>
              <div className="pt-6 gap-4 flex flex-col">
                <CTA
                  {...{
                    roundActionFunctions,
                    roundId,
                    hasCompletedPhase,
                    isAuthed,
                    phase,
                  }}
                />
                <span
                  // color="yellow.300"
                  // fontWeight="300"
                  // pt="4"
                  // textAlign="center"
                  className="text-themeYellow"
                >
                  {blurb}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
