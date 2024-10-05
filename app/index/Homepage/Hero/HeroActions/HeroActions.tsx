import { Navigation } from "@/enum/navigation";
import { roundProvider, userParticipationProvider } from "@/providers";
import Link from "next/link";
import { getBlurb } from "../../HowItWorks/getBlurb";

export async function HeroActions() {
  const {
    roundId,
    phase,
    song,
    dateLabels,
    hasRoundStarted,
    areSubmissionsOpen,
  } = await roundProvider();
  const nextRound = await roundProvider(roundId + 1);

  const { userId, userRoundDetails } = await userParticipationProvider();
  const signedUpBlurb = getBlurb({
    phase,
    roundId,
    phaseEndsDatelabel: dateLabels[phase].closes,
  });

  const signupLink = `${Navigation.SignUp}/${
    hasRoundStarted ? roundId + 1 : ""
  }`;

  const submitLink = `${Navigation.Submit}/${
    areSubmissionsOpen ? "" : roundId - 1
  }`;

  const songText =
    song.artist.length && song.title.length
      ? `${song.title} by ${song.artist}`
      : "";

  const signupsAreOpenString = `Signups are open for round ${
    hasRoundStarted ? roundId + 1 : roundId
  } `;

  // const statusBody = `Voting begins on ${
  //   (hasRoundStarted ? nextRound.dateLabels : dateLabels).voting.opens
  // }`;

  return (
    <div className="flex w-[80vw] md:max-w-[50vw] bg-cover bg-no-repeat bg-center mt-4 relative h-full md:text-right md:justify-end">
      <div className="flex-col flex md:mx-16">
        <div className="pb-8">
          <span className="font-fraunces text-md text-white flex-col flex">
            {songText ? "Currently covering" : userId ? "" : "Get Started"}
          </span>
          <span className="text-md md:text-lg font-semibold text-themeYellow font-fraunces">
            {songText || userRoundDetails?.hasSignedUp
              ? signedUpBlurb
              : signupsAreOpenString}
          </span>
        </div>
        <span className="text-md  text-white font-fraunces">
          {/* <p>{statusBody}</p> */}
          <div className="py-4">
            <div className="flex justify-end gap-4">
              <Link href={signupLink}>
                <button className="btn-main">Sign up for the next round</button>
              </Link>
            </div>
            <div className="flex justify-end gap-4">
              <Link href={submitLink}>
                <button className="btn-main">Submit your cover</button>
              </Link>
            </div>
          </div>
        </span>
      </div>
    </div>
  );
}