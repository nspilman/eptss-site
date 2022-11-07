import { ReactElement } from "react";
import { RoundDetails } from "../../../../types";
import { card } from "../Main.css";

export const RoundDisplay = ({
  round,
}: {
  round: RoundDetails;
}): ReactElement => {
  const { playlist, title, artist } = round;
  return (
    <div className={card}>
      <h3>
        <p className="song-round">
          {title} by {artist}
        </p>
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
