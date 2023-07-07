import {
  Box,
  Button,
  Heading,
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
  Text,
  Th,
  Tr,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { Round } from "queries/roundQueries";
import { format } from "date-fns";

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
        <Button>
          <CalendarIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent background="blue.900">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Stack direction="row">
            <Box width="50%">
              <Heading size="md">{displayedRoundName} round</Heading>
            </Box>
            <Button size="xs" onClick={handleButtonClick}>
              <Text size="xs">show {ctaName} round</Text>
            </Button>
          </Stack>
        </PopoverHeader>
        <PopoverBody>
          <Box>
            <Table>
              <Tr>
                <Th>
                  <Text>Milestone</Text>
                </Th>
                <Th>
                  <Text>Date</Text>
                </Th>
              </Tr>
              {milestones.map(({ name, date }) => (
                <Tr key={name}>
                  <Td>
                    <Text fontSize="sm">{name}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {format(new Date(date), "EEEE, MMMM do, yyyy")}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Table>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
