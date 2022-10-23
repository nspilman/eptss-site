import { ReactElement } from "react";
import { RoundDetails } from "../../../../types";

export const RoundDisplay = ({
  round,
}: {
  round: RoundDetails;
}): ReactElement => {
  const { playlist, title } = round;
  return (
    <div className="card">
      <h3>
        <p className="song-round">{title}</p>
      </h3>
      <div>
        {playlist && <div dangerouslySetInnerHTML={{ __html: playlist }} />}
      </div>
    </div>
  );
};
