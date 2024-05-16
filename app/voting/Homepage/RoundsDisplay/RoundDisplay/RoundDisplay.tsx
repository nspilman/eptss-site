'use client'
import { ReactElement } from "react";
import { RoundDetails } from "types";
import Link from "next/link";
import ReactPlayer from "react-player";


export const RoundDisplay = ({
  round,
  currentRound,
  isVotingPhase,
}: {
  round: RoundDetails;
  currentRound: number;
  isVotingPhase: boolean;
}): ReactElement => {
  const { playlistUrl, title, artist, roundId } = round;
  const showVotingUnderwayText =
    round.roundId === currentRound && isVotingPhase;

  const headingText = `${roundId}. ${
    showVotingUnderwayText ? "Voting Underway" : `${title} by ${artist}`
  }`;

  function getPlaylistUrl(inputText: string) {
    let regex =
      /href="(https:\/\/soundcloud\.com\/nate-spilman\/sets\/[^"]*)"/g;
    let match = regex.exec(inputText);
    return match ? match[1] : "No URL found";
  }

  let url = getPlaylistUrl(playlistUrl)
  console.log(url)
  return (
    <div className="relative">
      <div className="w-[80vw] rounded-lg z-10 relative p-2 my-2 bg-bgGradientDarkerBLue bg-opacity-10 flex justify-between">
        <span className="text-md md:text-lg font-fraunces font-semibold">
          <Link href={`/round/${roundId}`}>{headingText}</Link>
        </span>
        {playlistUrl && (
          <Link
            href={getPlaylistUrl(playlistUrl)}
            target="_blank"
            rel="noreferrer"
          >
            <span className="text-md font-bold font-roboto text-themeYellow  py-1 cursor-pointer">
              Listen
            </span>
          </Link>
        )}
        {!playlistUrl && (
          <span className="text-md font-light font-roboto ">
            The round is underway!
          </span>
        )}
      </div>
      <div>
        
<ReactPlayer url={url}/>
      </div>
    </div>
  );
};
