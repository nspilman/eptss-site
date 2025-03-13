"use client";

import { useState } from "react";
import { Round } from "@/data-access/roundService";
import { format, subMilliseconds } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/primitives";

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
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <CalendarIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-200 capitalize">
            {displayedRoundName} round
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleButtonClick}
            className="text-sm text-gray-300 hover:text-white"
          >
            Show {ctaName} round
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Milestone</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones.map(({ name, date }) => (
              <TableRow key={name}>
                <TableCell className="text-sm text-gray-300">{name}</TableCell>
                <TableCell className="text-sm text-gray-300">
                  {format(
                    subMilliseconds(new Date(date), 1),
                    "EEEE, MMMM do, yyyy"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PopoverContent>
    </Popover>
  );
};
