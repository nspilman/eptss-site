import { Navigation } from "@/enum/navigation";
import { roundProvider, userParticipationProvider } from "@/providers";
import { getBlurb } from "../../HowItWorks/getBlurb";
import { HeroClientActions } from "./HerClientActions";

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
  }`;

  return (
   <HeroClientActions songText={songText} signupLink={signupLink} submitLink={submitLink} signedUpBlurb={signedUpBlurb} signupsAreOpenString={signupsAreOpenString} userId={userId} userRoundDetails={userRoundDetails} roundNumber={roundId} dueDate={nextRound?.dateLabels?.signups.closes}/>
  );
}