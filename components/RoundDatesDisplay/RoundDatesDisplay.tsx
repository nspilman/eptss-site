import { useState } from "react";
import { Round } from "@/data-access/roundService";
import { format, subMilliseconds } from "date-fns";

type RoundDates = Pick<
  Round,
  | "signupOpens"
  | "votingOpens"
  | "coveringBegins"
  | "coversDue"
  | "listeningParty"
>;

export interface Props {
  current: RoundDates;
  next: RoundDates;
}

export const RoundDatesDisplayPopup = ({ current, next }: Props) => {
  const [displayedRoundName, setDisplayedRoundName] = useState<
    "current" | "next"
  >("current");

  const roundDates = displayedRoundName === "current" ? current : next;
  const ctaName = displayedRoundName === "current" ? "next" : "current";

  const milestones = [
    { name: "Signup Opens", date: roundDates.signupOpens },
    { name: "Round starts - Voting Opens", date: roundDates.votingOpens },
    {
      name: "Voting Closes - Covering begins",
      date: roundDates.coveringBegins,
    },
    { name: "Covers Due", date: roundDates.coversDue },
    { name: "Listening Party", date: roundDates.listeningParty },
  ];

  const handleButtonClick = () => {
    setDisplayedRoundName(ctaName);
  };

  return (
    <div>
      {/* <Popover>
      <PopoverTrigger>
        <button className="btn-main">
          <CalendarIcon />
        </button>
      </PopoverTrigger>
      <div className="bg-blue-900">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <div className="flex row">
            <div className="v-[50%]">
              <h2 className="font-fraunces text-white font-bold">
                {displayedRoundName} round
              </h2>
            </div>
            <button className="btn-main" onClick={handleButtonClick}>
              <span className="text-sm font-light font-roboto text-white">
                show {ctaName} round
              </span>
            </button>
          </div>
        </PopoverHeader>
        <PopoverBody>
          <div>
            <table>
              <tr>
                <th>
                  <span className="text-md font-light font-roboto text-white">
                    Milestone
                  </span>
                </th>
                <th>
                  <span className="text-md font-light font-roboto text-white">
                    Date
                  </span>
                </th>
              </tr>
              {milestones.map(({ name, date }) => (
                <tr key={name}>
                  <td>
                    <span className="text-sm font-light font-roboto text-white">
                      {name}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm font-light font-roboto text-white">
                      {format(
                        subMilliseconds(new Date(date), 1),
                        "EEEE, MMMM do, yyyy"
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </table>
          </div>
        </PopoverBody>
      </div>
    </Popover> */}
    </div>
  );
};
