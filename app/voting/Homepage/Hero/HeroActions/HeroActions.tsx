import { roundService } from "@/data-access/roundService";
import { Navigation } from "@/enum/navigation";
import {
  hasRoundStarted,
  hasSubmissionsOpened,
  roundManager,
} from "@/services/roundManager";
import Link from "next/link";

export async function HeroActions() {
  const { roundId, phase, song } = await roundManager();
  const nextRound = await roundManager(
    await roundService.getRoundById(roundId + 1)
  );
  const roundHasStarted = hasRoundStarted(phase);
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

  const statusBody = `Signups are open for round ${
    phase === "signups"
      ? roundId
      : `${roundId + 1}. Voting begins for the next round on ${
          nextRound?.dateLabels.voting.opens
        }`
  }`;

  return (
    <div className="flex w-[80vw] md:max-w-[50vw] bg-cover bg-no-repeat bg-center mt-4 relative h-full md:text-right md:justify-end">
      <div className="flex-col flex md:mx-16">
        <div className="pb-8">
          <span className="font-fraunces text-md text-white flex-col flex">
            {songText ? "Currently covering" : "Get Started"}
          </span>
          <span className="text-md md:text-lg font-semibold text-white font-fraunces">
            {songText}
          </span>
        </div>
        <span className="text-md  text-white font-fraunces">
          <p>{statusBody}</p>
          <div className="py-4">
            <div className="flex justify-end gap-4">
              <button className="btn-main">
                <Link href={signupLink}>Sign up for the next round</Link>
              </button>
            </div>
            <div className="flex justify-end gap-4">
              <button className="btn-main">
                <Link href={submitLink}>Submit your cover</Link>
              </button>
            </div>
          </div>
        </span>
      </div>
    </div>
  );
}
