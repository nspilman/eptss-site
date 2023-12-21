import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Table,
  Td,
  Th,
  Tr,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { Round } from "queries/roundQueries";
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
    <Popover>
      <PopoverTrigger>
        <button className="btn-main">
          <CalendarIcon />
        </button>
      </PopoverTrigger>
      <PopoverContent background="blue.900">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Stack direction="row">
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
          </Stack>
        </PopoverHeader>
        <PopoverBody>
          <div>
            <Table>
              <Tr>
                <Th>
                  <span className="text-md font-light font-roboto text-white">
                    Milestone
                  </span>
                </Th>
                <Th>
                  <span className="text-md font-light font-roboto text-white">
                    Date
                  </span>
                </Th>
              </Tr>
              {milestones.map(({ name, date }) => (
                <Tr key={name}>
                  <Td>
                    <span className="text-sm font-light font-roboto text-white">
                      {name}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-sm font-light font-roboto text-white">
                      {format(
                        subMilliseconds(new Date(date), 1),
                        "EEEE, MMMM do, yyyy"
                      )}
                    </span>
                  </Td>
                </Tr>
              ))}
            </Table>
          </div>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
