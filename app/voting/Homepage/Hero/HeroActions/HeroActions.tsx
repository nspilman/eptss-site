import { roundService } from "@/data-access/roundService";
import { Navigation } from "@/enum/navigation";
import {
  hasRoundStarted,
  hasSubmissionsOpened,
  roundProvider,
} from "@/providers/roundProvider";
import Link from "next/link";

export async function HeroActions() {
  const { roundId, phase, song, dateLabels } = await roundProvider();
  const nextRound = await roundProvider(
    await roundService.getRoundById(roundId + 1)
  );
  const roundHasStarted = await hasRoundStarted(phase);
  const submissionsAreOpenForCurrentRound = hasSubmissionsOpened(phase);

  const signupLink = `${Navigation.SignUp}/${
    roundHasStarted ? roundId + 1 : ""
  }`;

  const submitLink = `${Navigation.Submit}/${
    submissionsAreOpenForCurrentRound ? "" : roundId - 1
  }`;

  const songText =
    song.artist.length && song.title.length
      ? `${song.title} by ${song.artist}`
      : "";

  const signupsAreOpenString = `Signups are open for round ${
    roundHasStarted ? roundId + 1 : roundId
  } `;

  const statusBody = `Voting begins on ${
    (roundHasStarted ? nextRound.dateLabels : dateLabels).voting.opens
  }`;

  return (
    <div className="flex w-[80vw] md:max-w-[50vw] bg-cover bg-no-repeat bg-center mt-4 relative h-full md:text-right md:justify-end">
      <div className="flex-col flex md:mx-16">
        <div className="pb-8">
          <span className="font-fraunces text-md text-white flex-col flex">
            {songText ? "Currently covering" : "Get Started"}
          </span>
          <span className="text-md md:text-lg font-semibold text-themeYellow font-fraunces">
            {songText || signupsAreOpenString}
          </span>
        </div>
        <span className="text-md  text-white font-fraunces">
          <p>{statusBody}</p>
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
