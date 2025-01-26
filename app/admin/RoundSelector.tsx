"use client";

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RoundSelectorProps = {
  currentRoundId: number;
  allRoundIds: number[];
};

export const RoundSelector = ({ currentRoundId, allRoundIds }: RoundSelectorProps) => {
  return (
    <section className="flex items-center space-x-4 mb-8">
      <h2 className="text-2xl font-bold text-white">Round Details</h2>
      <Select
        defaultValue={currentRoundId.toString()}
        onValueChange={(value) => {
          window.location.href = `/admin?roundId=${value}`;
        }}
      >
        <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700/50 text-white">
          <SelectValue placeholder="Select a round" />
        </SelectTrigger>
        <SelectContent>
          {allRoundIds.map(id => (
            <SelectItem key={id} value={id.toString()}>
              Round {id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </section>
  );
};
