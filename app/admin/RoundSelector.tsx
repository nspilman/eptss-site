"use client";

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives";

type RoundSelectorProps = {
  currentRoundSlug: string;
  allRoundSlugs: string[];
};

export const RoundSelector = ({ currentRoundSlug, allRoundSlugs }: RoundSelectorProps) => {
  return (
    <section className="flex items-center space-x-4 mb-8">
      <h2 className="text-2xl font-bold text-white">Round Details</h2>
      <Select
        defaultValue={currentRoundSlug}
        onValueChange={(value) => {
          window.location.href = `/admin?roundId=${value}`;
        }}
      >
        <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700/50 text-white">
          <SelectValue placeholder="Select a round" />
        </SelectTrigger>
        <SelectContent>
          {allRoundSlugs.map(slug => (
            <SelectItem key={slug} value={slug}>
              {slug}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </section>
  );
};
