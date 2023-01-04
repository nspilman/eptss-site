import Link from "next/link";
import { ReactElement } from "react";
import { RoundDetails } from "../../../../types";
import { card } from "../Main.css";

export const RoundDisplay = ({
  round,
}: {
  round: RoundDetails;
}): ReactElement => {
  const { playlist, title, artist, round: roundId } = round;
  return (
    <div className={card}>
      <h3>
        <Link href={`/round/${roundId}`}>
          <p className="song-round">
            <a>
              Round {roundId} - {title} by {artist}
            </a>
          </p>
        </Link>
      </h3>
      <div>
        {playlist ? (
          <div dangerouslySetInnerHTML={{ __html: playlist }} />
        ) : (
          <>
            <span>The round is underway!</span>
            <br></br>
            <br></br>
          </>
        )}
      </div>
    </div>
  );
};
