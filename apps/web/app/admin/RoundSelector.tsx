"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@eptss/ui";

type RoundSelectorProps = {
  currentRoundSlug: string;
  allRoundSlugs: string[];
};

export const RoundSelector = ({ currentRoundSlug, allRoundSlugs }: RoundSelectorProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRoundChange = (value: string) => {
    // Preserve the current tab when changing rounds
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('slug', value);
    router.push(`/admin?${params.toString()}`);
  };

  return (
    <section className="flex items-center space-x-4 mb-8">
      <h2 className="text-2xl font-bold text-white">Round Details</h2>
      <Select
        value={currentRoundSlug}
        onValueChange={handleRoundChange}
      >
        <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700/50 text-white">
          <SelectValue placeholder="Select a round" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px] overflow-y-auto bg-secondary">
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
